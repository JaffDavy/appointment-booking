import express from 'express'

import { validate } from '../validators/auth.validator.js'
import registerHandler from '../controllers/auth.controller/register.controller.js'

const router = express.Router()

router.post('/register', validate, registerHandler)

export default router