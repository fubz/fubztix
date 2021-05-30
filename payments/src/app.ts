import express from 'express'
import 'express-async-errors'
import { json } from 'body-parser'
import cookieSession from 'cookie-session'
import { errorHandler, NotFoundError, currentUser } from '@fubztix/common'
import { createChargeRouter } from './routes/new'

const app = express()
app.set('trust proxy', true) // App is behind nginx proxy and should trust it
app.use(json())
app.use(
  cookieSession({
    signed: false,
    secure: process.env.NODE_ENV !== 'test',
  })
)
app.use(currentUser)
app.use(createChargeRouter)

// If real routes don't work, throw a not found
app.all('*', () => {
  throw new NotFoundError()
})

// Error Handler
app.use(errorHandler)

export { app }
