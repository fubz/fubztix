import mongoose from 'mongoose'
import request from 'supertest'
import { app } from '../../app'
import { Order, OrderStatus } from '../../models/order'
import { Ticket, TicketDoc } from '../../models/ticket'
import { natsWrapper } from '../../natsWrapper'

const validTicket = {
  id: mongoose.Types.ObjectId().toHexString(),
  title: 'concert',
  price: 20,
  version: 1,
}

it('has a route handler listening to /api/orders for POST requests', async () => {
  const response = await request(app).post('/api/orders').send({})

  expect(response.status).not.toEqual(404)
})

it('can only be access if user is signed in', async () => {
  await request(app).post('/api/orders').send({}).expect(401)
})

it('returns a status other than 401 if the user is signed in', async () => {
  const response = await request(app)
    .post('/api/orders')
    .set('Cookie', global.signin())
    .send({})

  expect(response.status).not.toEqual(401)
})

it('returns and error if the ticket does not exist', async () => {
  const ticketId = mongoose.Types.ObjectId()

  await request(app)
    .post('/api/orders')
    .set('Cookie', global.signin())
    .send({ ticketId })
    .expect(404)
})

it('returns an error if the ticket is already reserved', async () => {
  const ticket = Ticket.build(validTicket)
  await ticket.save()

  const order = Order.build({
    ticket,
    userId: 'userid',
    status: OrderStatus.Created,
    expiresAt: new Date(),
  })
  await order.save()

  await request(app)
    .post('/api/orders')
    .set('Cookie', global.signin())
    .send({ ticketId: ticket.id })
    .expect(400)
})

it('reserves a ticket', async () => {
  const ticket = Ticket.build(validTicket)
  await ticket.save()

  const { body: createdOrder } = await request(app)
    .post('/api/orders')
    .set('Cookie', global.signin())
    .send({ ticketId: ticket.id })
    .expect(201)

  const orderInDb = await Order.findById(createdOrder.id)
  expect(orderInDb!.ticket.toString()).toEqual(ticket.id)
})

it('emits and order created event', async () => {
  const ticket = Ticket.build(validTicket)
  await ticket.save()

  const { body: createdOrder } = await request(app)
    .post('/api/orders')
    .set('Cookie', global.signin())
    .send({ ticketId: ticket.id })
    .expect(201)

  expect(natsWrapper.client.publish).toHaveBeenCalled()
})
