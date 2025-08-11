import express from "express";
import {
  createActivity,
  getAllActivities,
  getActivityById,
  updateActivity,
  deleteActivity,
  joinActivity,
  leaveActivity,
  getMyActivities,
  updateActivityStatus,
  getActivitiesByCreator,
  recordAttendance,
  getAttendanceReport,
  getVolunteerActivities,
  getMyStatusSummary,
} from "../controllers/activity.controller.js";
import { authenticateToken, requireRole } from "../middleware/auth.middleware.js";

const router = express.Router();

// Public routes (for authenticated users)
router.route("/")
  .get(getAllActivities) // Get all activities with filtering
  .post(authenticateToken, requireRole(["admin", "staff",]), createActivity); // Create new activity (admin/staff only)

router.route("/my-activities")
  .get(authenticateToken, getMyActivities); // Get user's joined activities

router.route("/volunteer-activities")
  .get(authenticateToken, requireRole(["volunteer"]), getVolunteerActivities); // Get activities for volunteers with skill matching

router.route("/my-status")
  .get(authenticateToken, requireRole(["volunteer"]), getMyStatusSummary); // Get member status summary

router.route("/created")
  .get(authenticateToken, requireRole(["admin", "staff"]), getActivitiesByCreator); // Get activities created by user (admin/staff only)

router.route("/:id")
  .get(getActivityById) // Get activity by ID
  .put(authenticateToken, requireRole(["admin", "staff"]), updateActivity) // Update activity (admin/staff only)
  .delete(authenticateToken, requireRole(["admin", "staff"]), deleteActivity); // Delete activity (admin/staff only)

router.route("/:id/join")
  .post(authenticateToken, requireRole(["volunteer"]), joinActivity); // Join activity (volunteers only)

router.route("/:id/leave")
  .post(authenticateToken, requireRole(["volunteer"]), leaveActivity); // Leave activity (volunteers only)

router.route("/:id/status")
  .patch(authenticateToken, requireRole(["admin", "staff"]), updateActivityStatus); // Update activity status (admin/staff only)

// Attendance tracking routes (admin/staff only)
router.route("/:id/attendance")
  .post(authenticateToken, requireRole(["admin", "staff"]), recordAttendance) // Record time in/out via QR code
  .get(authenticateToken, requireRole(["admin", "staff"]), getAttendanceReport); // Get attendance report

export default router;
