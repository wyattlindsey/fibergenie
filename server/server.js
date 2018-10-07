// @flow

import express from 'express'
import logger from 'morgan'
import bodyParser from 'body-parser'

import routes from 'routes'
import users from 'routes/users'

import mongoose from 'config/database'

const app = express()
routes(app)

mongoose.connection.on(
  'error',
  console.error.bind(console, 'MongoDB connection error: ')
)

app.set(
  'secretKey',
  '522d56346b553476375b6a20655c61772e2c2f3c4e7641402d29316e7a'  // todo store in config
)

app.use(logger('dev'))
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use('/users', users)

app.listen(3000, () => console.log('Express server listening on port 3000')) // eslint-disable-line

export default app
