import { ExpirationCompleteEvent, Publisher, Subjects } from '@fubztix/common'

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
  subject: Subjects.ExpirationComplete = Subjects.ExpirationComplete

  publish(data: ExpirationCompleteEvent['data']): Promise<void> {
    return super.publish(data)
  }
}
