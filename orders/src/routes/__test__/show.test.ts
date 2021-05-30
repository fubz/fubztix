import request from 'supertest'
import { Ticket } from '../../models/ticket'
import { app } from '../../app'
import mongoose from 'mongoose'

it('fetches the order', async () => {
  // Create a Ticket
  const ticket = Ticket.build({
    id: mongoose.Types.ObjectId().toHexString(),
    title: 'testTix',
    price: 42,
  })
  await ticket.save()

  const user = global.signin()
  // Make an order for this ticket
  const { body: createdOrder } = await request(app)
    .post('/api/orders')
    .set('Cookie', user)
    .send({ ticketId: ticket.id })

  // Make a request to fetch the order
  const { body: fetchedOrder } = await request(app)
    .get(`/api/orders/${createdOrder.id}`)
    .set('Cookie', user)
    .send()
    .expect(200)

  expect(fetchedOrder.id).toEqual(createdOrder.id)
})

it('It returns and error if one user fetches another users order', async () => {
  // Create a Ticket
  const ticket = Ticket.build({
    id: mongoose.Types.ObjectId().toHexString(),
    title: 'testTix',
    price: 42,
  })
  await ticket.save()

  // Make an order for this ticket
  const { body: createdOrder } = await request(app)
    .post('/api/orders')
    .set('Cookie', global.signin())
    .send({ ticketId: ticket.id })

  // Make a request to fetch the order
  await request(app)
    .get(`/api/orders/${createdOrder.id}`)
    .set('Cookie', global.signin())
    .send()
    .expect(401)
})
