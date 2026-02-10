import { Router } from "express";
import { bookAppointment, getAppointments } from "../controllers/appointment.controller.js";
import authMiddleware from "../middleware/auth.middleware.js"

const router = Router()

router.post("/book", authMiddleware, bookAppointment)
router.get("/list", authMiddleware, getAppointments)

export default router