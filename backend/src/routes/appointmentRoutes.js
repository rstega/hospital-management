import { Router } from "express";
import {
  cancelAppointment,
  createAppointment,
  getAppointments,
} from "../controllers/appointmentController.js";

const router = Router();

router.get("/", getAppointments);
router.post("/", createAppointment);
router.patch("/:id/cancel", cancelAppointment);

export default router;