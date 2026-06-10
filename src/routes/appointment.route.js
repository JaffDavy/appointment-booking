import { Router } from "express";
import { bookAppointment, getAppointments, cancelAppointment } from "../controllers/appointment.controller.js";
import authMiddleware from "../middleware/auth.middleware.js"

const router = Router()

router.post("/book", authMiddleware, bookAppointment)
router.get("/list", authMiddleware, getAppointments)
router.post("/cancel", authMiddleware, cancelAppointment);

export default router