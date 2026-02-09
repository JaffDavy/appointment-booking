import express from "express"
import { createSlot, getAvailableSlots, deleteSlot } from "../controllers/slot.controller.js"
import authMiddleware from "../middleware/auth.middleware.js"

const router = express.Router()

router.post("/", authMiddleware, createSlot)
router.delete("/:slot_id", authMiddleware, deleteSlot)
router.get("/available", authMiddleware, getAvailableSlots)


export default router