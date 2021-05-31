import mongoose from 'mongoose'
import { app } from './app'
import { natsWrapper } from './natsWrapper'
import { OrderCreatedListener } from './events/listeners/orderCreatedListener'
import { OrderCancelledListener } from './events/listeners/orderCancelledListener'

const start = async () => {
  console.log(`payments service starting up on ${process.env.HOSTNAME}`)
  // Check environment variables
  if (!process.env.JWT_KEY) {
    throw new Error('Please define JWT_KEY environment variable')
  }

  if (!process.env.MONGO_URI) {
    throw new Error('Please define MONGO_URI environment variable')
  }

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

    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    })
    console.log('connected to mongodb')
  } catch (error) {
    console.error(error)
  }

  new OrderCreatedListener(natsWrapper.client).listen()
  new OrderCancelledListener(natsWrapper.client).listen()

  app.listen(3000, () => {
    console.log(`${process.env.HOSTNAME} listening on 3000`)
  })
}

start()
