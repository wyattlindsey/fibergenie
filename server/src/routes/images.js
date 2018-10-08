// @flow

import express from 'express'

import imageController from 'api/controllers/images'

const router = express.Router()

router.post('/upload', imageController.upload)
router.get('/user', imageController.getByUserId)
router.get('/:imageId', imageController.getById)
router.put('/:imageId', imageController.updateById)
router.delete('/:imageId', imageController.deleteById)

export default router
