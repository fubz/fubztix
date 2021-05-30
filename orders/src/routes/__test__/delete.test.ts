import request from 'supertest'
import { Ticket } from '../../models/ticket'
import { app } from '../../app'
import { Order, OrderStatus } from '../../models/order'
import { natsWrapper } from '../../natsWrapper'
import mongoose from 'mongoose'

it('Cancels and existing order', async () => {
  // Create a Ticket
  const ticket = Ticket.build({
    id: mongoose.Types.ObjectId().toHexString(),
    title: 'testTix',
    price: 41,
  })
  await ticket.save()

  const user = global.signin()
  // Make and order for that Ticket
  const { body: orderCreated } = await request(app)
    .post('/api/orders')
    .set('Cookie', user)
    .send({ ticketId: ticket.id })
    .expect(201)

  // Make a request to cancel the Order
  const { body: cancelledOrder } = await request(app)
    .delete(`/api/orders/${orderCreated.id}`)
    .set('Cookie', user)
    .send()
    .expect(204)

  console.log('cancelledOrder', cancelledOrder)
  // Apparently if a 204 is returned, no body will be sent along
  // Expectation to ensure the ticket is cancelled
  // once from the response
  // expect(cancelledOrder.status).toEqual(OrderStatus.Cancelled)

  // but more importantly from the database
  const cancelledOrderFromDb = await Order.findById(orderCreated.id)
  expect(cancelledOrderFromDb!.status).toEqual(OrderStatus.Cancelled)
})

it('publishes an order:cancelled event', async () => {
  // Create a Ticket
  const ticket = Ticket.build({
    id: mongoose.Types.ObjectId().toHexString(),
    title: 'testTix',
    price: 41,
  })
  await ticket.save()

  const user = global.signin()
  // Make and order for that Ticket
  const { body: orderCreated } = await request(app)
    .post('/api/orders')
    .set('Cookie', user)
    .send({ ticketId: ticket.id })
    .expect(201)

  // Make a request to cancel the Order
  const { body: cancelledOrder } = await request(app)
    .delete(`/api/orders/${orderCreated.id}`)
    .set('Cookie', user)
    .send()
    .expect(204)

  expect(natsWrapper.client.publish).toHaveBeenCalled()
})
