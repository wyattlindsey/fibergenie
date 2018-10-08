// @flow

import express from 'express'

import imageController from 'api/controllers/images'

const router = express.Router()

router.post('/upload', imageController.upload)
router.get('/user', imageController.getByUserId)

export default router