import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose from 'mongoose'
import jwt from 'jsonwebtoken'

declare global {
  namespace NodeJS {
    interface Global {
      signin(): string[]
    }
  }
}

jest.mock('../natsWrapper')

let mongo: any

beforeAll(async () => {
  // Our app needs JWT_KEY defined
  process.env.JWT_KEY = 'jesttest'

  mongo = new MongoMemoryServer()
  const mongoUri = await mongo.getUri()

  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
})

beforeEach(async () => {
  jest.clearAllMocks()
  const collections = await mongoose.connection.db.collections()

  for (let collection of collections) {
    await collection.deleteMany({})
  }
})

afterAll(async () => {
  await mongo.stop()
  await mongoose.connection.close()
})

global.signin = () => {
  // Build a JWT payload. { id, email }
  const id = mongoose.Types.ObjectId().toHexString()
  const payload = {
    id,
    email: `${id}@test.com`,
  }

  // create the jwt
  const token = jwt.sign(payload, process.env.JWT_KEY!)

  // build the session object. { jwt: MY_JWT }
  const session = { jwt: token }

  // Turn that session into JSON
  const sessionString = JSON.stringify(session)

  // Take JSON and encode it as base64
  const base64 = Buffer.from(sessionString).toString('base64')

  // return a string that's the cookie with encoded data
  return [`express:sess=${base64}`]
}
