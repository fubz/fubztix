import request from 'supertest'
import { app } from '../../app'
import mongoose from 'mongoose'

const validTicket = {
  title: 'concert',
  price: 20.2,
}

it('returns a 404 if the ticket is not found', async () => {
  const id = new mongoose.Types.ObjectId().toHexString()
  await request(app).get(`/api/tickets/${id}`).send().expect(404)
})

it('returns the ticket if the ticket is found', async () => {
  // Create a ticket
  const newTicket = await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send(validTicket)
    .expect(201)

  const ticketSearch = await request(app)
    .get(`/api/tickets/${newTicket.body.id}`)
    .send()
    .expect(200)

  expect(ticketSearch.body.title).toEqual(validTicket.title)
  expect(ticketSearch.body.price).toEqual(validTicket.price)
})
