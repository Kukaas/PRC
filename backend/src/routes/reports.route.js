import express from "express";
import { authenticateToken, requireRole } from "../middleware/auth.middleware.js";
import { getVolunteerHoursByYear } from "../controllers/reports.controller.js";

const router = express.Router();

router.route("/volunteer-hours")
  .get(authenticateToken, requireRole(["admin", "staff"]), getVolunteerHoursByYear);

export default router;


