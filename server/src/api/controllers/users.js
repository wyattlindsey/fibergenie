// @flow

import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

import userModel from 'api/models/users'

import type { NextFunction, $Request, $Response } from 'express'

export const create = (
  req: $Request,
  res: $Response,
  next: NextFunction
): void => {
  const { firstName, lastName, email, password } = req.body

  // todo check for pre-existing account with the same email

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
        res.json({
          status: 'error',
          message: 'authentication failed',
          data: null,
        })
      }
    }
  )
}

export default {
  create,
  authenticate,
}
