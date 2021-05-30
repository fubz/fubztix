import { Listener, PaymentCreatedEvent, Subjects } from '@fubztix/common'
import { queueGroupName } from './queueGroupName'
import { Message } from 'node-nats-streaming'
import { Order, OrderStatus } from '../../models/order'

export class PaymentCreatedListener extends Listener<PaymentCreatedEvent> {
  subject: Subjects.PaymentCreated = Subjects.PaymentCreated
  queueGroupName = queueGroupName

  async onMessage(data: PaymentCreatedEvent['data'], msg: Message) {
    const order = await Order.findById(data.orderId)

    if (!order) {
      throw Error('Order not found')
    }

    order.set({ status: OrderStatus.Complete })
    await order.save()

    // Emit an event that the order is complete
    // Due to context of the course

    msg.ack()
  }
}
