import mongoose from 'mongoose'
import { app } from './app'

const start = async () => {
  console.log(`auth service starting up on ${process.env.HOSTNAME}`)
  // Check environment variables
  if (!process.env.JWT_KEY) {
    throw new Error('Please define JWT_KEY environment variable')
  }

  if (!process.env.MONGO_URI) {
    throw new Error('Please define MONGO_URI environment variable')
  }

  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    })
    console.log('connected to mongodb')
  } catch (error) {
    console.error(error)
  }

  app.listen(3000, () => {
    console.log(`${process.env.HOSTNAME} listening on 3000`)
  })
}

start()
