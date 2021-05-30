import nats from 'node-nats-streaming'
import { TicketCreatedPublisher } from './events/TicketCreatedPublisher'

console.clear()

const stan = nats.connect('ticketing', 'abc', {
  url: 'http://localhost:4222',
})

stan.on('connect', async () => {
  console.log('Publisher connecting to NATS')

  const publisher = new TicketCreatedPublisher(stan)
  try {
    await publisher.publish({ id: '123', price: 0.1, title: 'blah me' })
  } catch (err) {
    console.log(err)
  }

  //

  // const data = JSON.stringify({
  //   id: '123',
  //   title: 'convert',
  //   price: 20,
  // })
  //
  // stan.publish('ticket:created', data, () => {
  //   console.log('Event published: ticket:created')
  // })
})
