import express, { Request, Response } from 'express'
const router = express.Router()
import { body } from 'express-validator'
import { User } from '../models/user'
import jwt from 'jsonwebtoken'
import { validateRequest, BadRequestError } from '@fubztix/common'

router.post(
  '/api/users/signup',
  [
    body('email').isEmail().withMessage('Email must be valid'),
    body('password')
      .trim()
      .isStrongPassword({
        minSymbols: 0,
        minUppercase: 0,
        minNumbers: 0,
        minLength: 6,
      })
      .withMessage('Password must be strong'),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { email, password } = req.body

    const existingUser = await User.findOne({ email })

    if (existingUser) {
      console.log('Email in use', email)
      throw new BadRequestError('Email in use')
    }

    const user = User.build({ email, password })
    const save = await user.save()

    // Generate JWT
    const userJwt = jwt.sign(
      {
        id: user.id,
        email: user.email,
      },
      process.env.JWT_KEY!
    )

    // Store JWT on the session
    req.session = { jwt: userJwt }

    res.status(201).send(user)
  }
)

export { router as signupRouter }
