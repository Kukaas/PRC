import express from "express";
import {
    createEvaluation,
    getEvaluationsByActivity,
    getEvaluationsByVolunteer,
} from "../controllers/evaluation.controller.js";
import { authenticateToken, requireRole } from "../middleware/auth.middleware.js";

const router = express.Router();

// Create evaluation (Admin/Staff only)
router.post(
    "/",
    authenticateToken,
    requireRole(["admin", "staff"]),
    createEvaluation
);

// Get evaluations by activity (Admin/Staff only)
router.get(
    "/activity/:activityId",
    authenticateToken,
    requireRole(["admin", "staff"]),
    getEvaluationsByActivity
);

// Get evaluations by volunteer (Admin/Staff/Volunteer - volunteer can see their own?)
// For now, let's restrict to admin/staff, or allow volunteer to see their own if needed later.
// Assuming admin wants to see a volunteer's history.
router.get(
    "/volunteer/:volunteerId",
    authenticateToken,
    requireRole(["admin", "staff"]),
    getEvaluationsByVolunteer
);

export default router;
