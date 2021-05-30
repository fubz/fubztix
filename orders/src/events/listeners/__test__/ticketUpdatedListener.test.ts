import { natsWrapper } from '../../../natsWrapper'
import { TicketCreatedEvent, TicketUpdatedEvent } from '@fubztix/common'
import mongoose from 'mongoose'
import { Message } from 'node-nats-streaming'
import { Ticket } from '../../../models/ticket'
import { TicketUpdatedListener } from '../ticketUpdatedListener'

const setup = async () => {
  // Create an instance of the listener
  const listener = new TicketUpdatedListener(natsWrapper.client)

  //Create and save a ticket
  const ticket = Ticket.build({
    id: mongoose.Types.ObjectId().toHexString(),
    title: 'test tix ticketUpdatedListener',
    price: 1337,
  })
  await ticket.save()

  // Create a fake data event
  const data: TicketUpdatedEvent['data'] = {
    version: ticket.version + 1,
    id: ticket.id,
    title: 'test tix',
    price: 42,
    userId: mongoose.Types.ObjectId().toHexString(),
  }
  // create a fake message object
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  }

  return { listener, data, msg, ticket }
}

it('finds, updates, and saves a ticket', async () => {
  const { listener, data, msg, ticket } = await setup()
  // call the onMessage function with the data and message objects
  await listener.onMessage(data, msg)

  const updatedTicket = await Ticket.findById(ticket.id)

  expect(updatedTicket).toBeDefined()
  expect(updatedTicket!.title).toEqual(data.title)
  expect(updatedTicket!.price).toEqual(data.price)
  expect(updatedTicket!.version).toEqual(data.version)
})

it('acks the message when valid', async () => {
  const { data, listener, msg } = await setup()
  // call the onMessage function with the data and message objects
  await listener.onMessage(data, msg)
  // write assertions to make sure ack function is called
  expect(msg.ack).toHaveBeenCalled()
})

it('doesnt ack when it cannot find the ticket id', async () => {
  const { data, listener, msg, ticket } = await setup()

  data.id = mongoose.Types.ObjectId().toHexString()
  await expect(listener.onMessage(data, msg)).rejects.toThrow(
    'Ticket not found'
  )

  expect(msg.ack).not.toHaveBeenCalled()
})

it('does not call ack if the event is out of order', async () => {
  const { msg, data, listener, ticket } = await setup()

  // Wont find a ticket to update from the future
  data.version = data.version + 10
  await expect(listener.onMessage(data, msg)).rejects.toThrow(
    'Ticket not found'
  )

  expect(msg.ack).not.toHaveBeenCalled()

  // Wont find a ticket from the past to update
  data.version = data.version - 100
  await expect(listener.onMessage(data, msg)).rejects.toThrow(
    'Ticket not found'
  )

  expect(msg.ack).not.toHaveBeenCalled()
})
