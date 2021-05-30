import express from 'express'
import 'express-async-errors'
import { json } from 'body-parser'
import cookieSession from 'cookie-session'
import { currentuserRouter } from './routes/currentuser'
import { signinRouter } from './routes/signin'
import { signoutRouter } from './routes/signout'
import { signupRouter } from './routes/signup'
import { errorHandler, NotFoundError } from '@fubztix/common'

const app = express()
app.set('trust proxy', true) // App is behind nginx proxy and should trust it
app.use(json())
app.use(
  cookieSession({
    signed: false,
    secure: process.env.NODE_ENV !== 'test',
  })
)

app.use(currentuserRouter)
app.use(signinRouter)
app.use(signoutRouter)
app.use(signupRouter)

// If real routes don't work, throw a not found
app.all('*', () => {
  throw new NotFoundError()
})

// Error Handler
app.use(errorHandler)

export { app }
