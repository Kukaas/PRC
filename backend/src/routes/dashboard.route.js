import express from "express";
import { authenticateToken, requireRole } from "../middleware/auth.middleware.js";
import { getDashboardOverview } from "../controllers/dashboard.controller.js";

const router = express.Router();

router.route("/overview").get(authenticateToken, requireRole(["admin", "staff"]), getDashboardOverview);

export default router;


