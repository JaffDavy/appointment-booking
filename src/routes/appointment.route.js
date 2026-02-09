import { Router } from "express";
import { bookAppointment } from "../controllers/appointment.controller.js";
import authMiddleware from "../middleware/auth.middleware.js"

const router = Router()

router.post("/book", authMiddleware, bookAppointment)

export default router