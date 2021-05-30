import { OrderCancelledEvent, Publisher, Subjects } from '@fubztix/common'

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
  subject: Subjects.OrderCancelled = Subjects.OrderCancelled
}
