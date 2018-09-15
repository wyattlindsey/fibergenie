// @flow

import handlers from 'handlers'

import type { $Application, $Request, $Response } from 'express'

const multer = require('multer')
const upload = multer({ dest: 'public/uploads/tmp' })

const routes = (app: $Application): void => {
  app.get('/', (req: $Request, res: $Response): void => {
    res.sendStatus(200)
  })

  app.post('/image', upload.single('chart'), handlers.image.upload)

  app.get('*', (req: $Request, res: $Response): void => {
    res.sendStatus(404)
  })
}

export default routes
