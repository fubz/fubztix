import mongoose from 'mongoose'
import { app } from './app'
import { natsWrapper } from './natsWrapper'
import { TicketCreatedListener } from './events/listeners/ticketCreatedListener'
import { TicketUpdatedListener } from './events/listeners/ticketUpdatedListener'
import { ExpirationCompleteListener } from './events/listeners/expirationCompleteListener'
import { PaymentCreatedListener } from './events/listeners/paymentCreatedListener'

const start = async () => {
  console.log(`orders service starting up on ${process.env.HOSTNAME}`)
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

    new TicketCreatedListener(natsWrapper.client).listen()
    new TicketUpdatedListener(natsWrapper.client).listen()
    new ExpirationCompleteListener(natsWrapper.client).listen()
    new PaymentCreatedListener(natsWrapper.client).listen()

    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    })
    console.log('Connected to MongoDb')
  } catch (error) {
    console.error(error)
  }

  app.listen(3000, () => {
    console.log(`${process.env.HOSTNAME} listening on 3000`)
  })
}

start()
