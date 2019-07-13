// @flow

import express from 'express'
import userController from 'api/controllers/users'

const router = express.Router()

router.post('/check', userController.check)
router.post('/register', userController.create)
router.post('/login', userController.login)

export default router
