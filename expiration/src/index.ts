import { natsWrapper } from './natsWrapper'
import { OrderCreatedListener } from './events/listeners/orderCreatedListener'

const start = async () => {
  console.log(`expiration service starting up on ${process.env.HOSTNAME}`)
  // Check environment variables
  if (!process.env.NATS_CLUSTER_ID) {
    throw new Error('Please define NATS_CLUSTER_ID environment variable')
  }

  if (!process.env.NATS_CLIENT_ID) {
    throw new Error('Please define NATS_CLIENT_ID environment variable')
  }

  if (!process.env.NATS_URL) {
    throw new Error('Please define NATS_URL environment variable')
  }

  try {
    await natsWrapper.connect(
      process.env.NATS_CLUSTER_ID,
      process.env.NATS_CLIENT_ID,
      process.env.NATS_URL
    )

    natsWrapper.client.on('close', () => {
      console.log('NATS connection closed')
      process.exit()
    })

    process.on('SIGINT', () => natsWrapper.client.close())
    process.on('SIGTERM', () => natsWrapper.client.close())

    new OrderCreatedListener(natsWrapper.client).listen()
  } catch (error) {
    console.error(error)
  }
}

start()
