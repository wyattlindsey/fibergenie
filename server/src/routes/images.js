// @flow

import express from 'express'
const multer = require('multer')
const upload = multer({ dest: 'public/uploads/tmp' })

import imageController from 'api/controllers/images'

const router = express.Router()

router.post('/upload', upload.single('chart'), imageController.upload)

export default router
