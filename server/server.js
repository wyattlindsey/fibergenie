// @flow

import express from 'express'
import logger from 'morgan'
import bodyParser from 'body-parser'
import dotProp from 'dot-prop'
import jwt from 'jsonwebtoken'
import multer from 'multer'

import images from 'routes/images'
import users from 'routes/users'

import mongoose from 'config/database'

import type { NextFunction, $Request, $Response } from 'express'

const app = express()

const upload = multer({ dest: 'public/uploads/tmp' })

mongoose.connection.on(
  'error',
  console.error.bind(console, 'MongoDB connection error: ')
)

app.set(
  'secretKey',
  '522d56346b553476375b6a20655c61772e2c2f3c4e7641402d29316e7a' // todo store in config
)

app.use(logger('dev'))
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(upload.single('chart'))

const validateUser = (
  req: $Request,
  res: $Response,
  next: NextFunction
): void => {
  const authToken = dotProp
    .get(req, 'headers.authorization', '')
    .replace('Bearer ', '')

  jwt.verify(authToken, req.app.get('secretKey'), (err, decoded) => {
    if (err) {
      res.json({ status: 'error', message: err.message, data: null })
    } else {
      req.body.userId = decoded.id
      next()
    }
  })
}

app.use('/users', users)
app.use('/images', validateUser, images)

app.listen(3000, () => console.log('Express server listening on port 3000')) // eslint-disable-line

export default app
