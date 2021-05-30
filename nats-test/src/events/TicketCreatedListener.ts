import { Listener } from './baseListener'
import { Message } from 'node-nats-streaming'
import { TicketCreatedEvent } from './ticketCreatedEvent'
import { Subjects } from './subjects'

export class TicketCreatedListener extends Listener<TicketCreatedEvent> {
  readonly subject: Subjects.TicketCreated = Subjects.TicketCreated
  queueGroupName = 'payments-server'

  onMessage(data: TicketCreatedEvent['data'], msg: Message): void {
    console.log(`TicketCreatedListener`, data)

    console.log(data.price)

    msg.ack()
  }
}
