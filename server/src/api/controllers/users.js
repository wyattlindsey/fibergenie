// @flow

import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

import userModel from 'api/models/users'

import type { NextFunction, $Request, $Response } from 'express'

export const check = async (
  req: $Request,
  res: $Response,
  next: NextFunction
): Promise<void> => {
  const { email } = req.body

  try {
    const user = await userModel.findOne({ email })
    if (user) {
      res.json({
        status: 'failure',
        message: 'A user with this email already exists.',
        data: null,
      })
    } else {
      res.json({
        status: 'success',
        message: 'username available',
        data: null,
      })
    }
  } catch (e) {
    console.error(e)
    next(e)
  }
}

export const create = (
  req: $Request,
  res: $Response,
  next: NextFunction
): void => {
  const { firstName, lastName, email, password } = req.body

  userModel.create(
    {
      firstName,
      lastName,
      email,
      password,
    },
    err => {
      if (err) {
        next(err)
        return
      }
      res.status(201).json({
        status: 'success',
        message: 'user creation successful',
        data: null,
      })
    }
  )
}

export const authenticate = (
  req: $Request,
  res: $Response,
  next: NextFunction
): void => {
  const { email, password } = req.body

  userModel.findOne(
    {
      email,
    },
    (err, userInfo) => {
      if (err) {
        next(err)
        return
      }

      const { _id: id, password: userPassword } = userInfo
      if (bcrypt.compareSync(password, userPassword)) {
        const token = jwt.sign({ id }, req.app.get('secretKey'), {
          expiresIn: '1h',
        })
        res.json({
          status: 'success',
          message: 'authentication successful',
          data: { token },
        })
      } else {
        res.status(404).json({
          status: 'error',
          message: 'authentication failed',
          data: null,
        })
      }
    }
  )
}

export default {
  check,
  create,
  authenticate,
}
