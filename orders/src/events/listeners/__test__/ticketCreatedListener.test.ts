import { TicketCreatedListener } from '../ticketCreatedListener'
import { natsWrapper } from '../../../natsWrapper'
import { TicketCreatedEvent } from '@fubztix/common'
import mongoose from 'mongoose'
import { Message } from 'node-nats-streaming'
import { Ticket } from '../../../models/ticket'

const setup = async () => {
  // Create an instance of the listener
  const listener = new TicketCreatedListener(natsWrapper.client)
  // Create a fake data event
  const data: TicketCreatedEvent['data'] = {
    version: 0,
    id: mongoose.Types.ObjectId().toHexString(),
    title: 'test tix',
    price: 42,
    userId: mongoose.Types.ObjectId().toHexString(),
  }
  // create a fake message object
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  }

  return { listener, data, msg }
}

it('creates and saves a ticket', async () => {
  const { listener, data, msg } = await setup()
  // call the onMessage function with the data and message objects
  await listener.onMessage(data, msg)
  // write assertions to make sure a ticket was created
  const ticket = await Ticket.findById(data.id)

  expect(ticket).toBeDefined()
  expect(ticket!.title).toEqual(data.title)
  expect(ticket!.price).toEqual(data.price)
})

it('acks the message when valid', async () => {
  const { data, listener, msg } = await setup()
  // call the onMessage function with the data and message objects
  await listener.onMessage(data, msg)
  // write assertions to make sure ack function is called
  expect(msg.ack).toHaveBeenCalled()
})
