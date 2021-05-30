import { Publisher, Subjects, TicketUpdatedEvent } from '@fubztix/common'

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
  subject: Subjects.TicketUpdated = Subjects.TicketUpdated
}
