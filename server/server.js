// @flow

import express from 'express'
import logger from 'morgan'
import bodyParser from 'body-parser'
import routes from 'routes'

const app = express()
routes(app)

app.use(logger('dev'))
app.use(bodyParser.urlencoded({ extended: false }))

app.listen(3000, () => console.log('Express server listening on port 3000')) // eslint-disable-line

export default app
