import express from "express";
import * as slotController from "../controllers/slot.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";
import { authorizeProvider } from "../middleware/role.middleware.js";

const router = express.Router();

router.post(
  "/",
  authMiddleware,
  authorizeProvider,
  (req, res, next) => {
    console.log("REACHED CONTROLLER");
    next();
  },
  slotController.createSlot,
);
router.get("/available", authMiddleware, slotController.getAvailableSlots);

router.delete(
  "/:slot_id",
  authMiddleware,
  authorizeProvider,
  slotController.deleteSlot,
);

export default router;
