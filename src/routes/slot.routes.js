import express from 'express';
import * as slotController from '../controllers/slot.controller.js'; 
import authMiddleware from '../middleware/auth.middleware.js';
import { authorizeProvider } from '../middleware/role.middleware.js';

const router = express.Router();

router.post('/', authMiddleware, authorizeProvider, slotController.createSlot);

export default router;