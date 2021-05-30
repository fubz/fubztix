import { Message } from 'node-nats-streaming'
import { Listener, OrderCreatedEvent, Subjects } from '@fubztix/common'
import { queueGroupName } from './queueGroupName'
import { Ticket } from '../../models/ticket'
import { TicketUpdatedPublisher } from '../publishers/ticketUpdatedPublisher'

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  subject: Subjects.OrderCreated = Subjects.OrderCreated
  queueGroupName = queueGroupName

  async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
    // Find the ticket that the order created event is reserving
    const ticket = await Ticket.findById(data.ticket.id)

    // If no ticket, throw error
    if (!ticket) {
      throw new Error('Ticket not found')
    }

    // Mark the ticket as being reserved by setting it's orderId property
    ticket.set({ orderId: data.id })

    // Save the ticket
    await ticket.save()

    // Tell everyone the ticket was updated!!!
    await new TicketUpdatedPublisher(this.client).publish({
      id: ticket.id,
      price: ticket.price,
      title: ticket.title,
      userId: ticket.userId,
      orderId: ticket.orderId,
      version: ticket.version,
    })

    // ack the message
    msg.ack()
  }
}
