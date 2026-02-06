import express from "express"
import { createSlot, getAvailableSlots } from "../controllers/slot.controller.js"
import authMiddleware from "../middleware/auth.middleware.js"

const router = express.Router()

router.post("/", authMiddleware, createSlot)

router.get("/available", authMiddleware, getAvailableSlots)

export default router