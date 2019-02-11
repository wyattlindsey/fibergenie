// @flow

import express from 'express'
import userController from 'api/controllers/users'

const router = express.Router()

router.post('/check', userController.check)
router.post('/register', userController.create)
router.post('/authenticate', userController.authenticate)

export default router
