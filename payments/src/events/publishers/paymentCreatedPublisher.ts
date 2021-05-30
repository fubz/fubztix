import { PaymentCreatedEvent, Publisher, Subjects } from '@fubztix/common'

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
  subject: Subjects.PaymentCreated = Subjects.PaymentCreated
}
