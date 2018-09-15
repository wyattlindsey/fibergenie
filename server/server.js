// @flow

import express from 'express'
import routes from 'routes'

const app = express()
routes(app)

app.listen(3000, () => console.log('Express server listening on port 3000'))  // eslint-disable-line

export default app
