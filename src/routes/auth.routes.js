import express from 'express'
import loginHandler from '../models/user.model.js'
import { loginValidator } from '../validators/auth.validator.js'

import { validate } from '../validators/auth.validator.js'
import registerHandler from '../controllers/auth.controller/register.controller.js'

const router = express.Router()

router.post('/register', validate, registerHandler)

router.post('/login', loginValidator, loginHandler)

export default router