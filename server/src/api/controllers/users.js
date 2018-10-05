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
  const { email, name, password } = req.body

  userModel.create(
    {
      name,
      email,
      password,
    },
    err => {
      if (err) {
        next(err)
        return
      }
      res.json({
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
  const { email, password } = req

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
