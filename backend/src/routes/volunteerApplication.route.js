import express from "express";
import {
  submitApplication,
  getMyApplication,
  updateApplication,
  deleteApplication,
  getAllApplications,
  getApplicationById,
  updateApplicationStatus,
  getApplicationStats,
  canResubmitApplication,
  sendTrainingNotification,
  bulkSendTrainingNotifications,
  updateTrainingStatus,
} from "../controllers/volunteerApplication.controller.js";
import { authenticateToken } from "../middleware/auth.middleware.js";

const router = express.Router();

// Volunteer routes (require authentication)
router.use(authenticateToken);

// Submit new application
router.post("/submit", submitApplication);

// Resubmit application (for rejected applications)
router.post("/resubmit", submitApplication);

// Check if user can resubmit application
router.get("/can-resubmit", canResubmitApplication);

// Get user's own application
router.get("/my-application", getMyApplication);

// Update user's own application
router.put("/update", updateApplication);

// Delete user's own application
router.delete("/delete/:id", deleteApplication);

// Admin routes (require admin role)
router.get("/admin/all", authenticateToken, async (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Access denied. Admin role required.",
    });
  }
  next();
}, getAllApplications);

router.get("/admin/stats", authenticateToken, async (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Access denied. Admin role required.",
    });
  }
  next();
}, getApplicationStats);

router.get("/admin/:id", authenticateToken, async (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Access denied. Admin role required.",
    });
  }
  next();
}, getApplicationById);

router.put("/admin/:id/status", authenticateToken, async (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Access denied. Admin role required.",
    });
  }
  next();
}, updateApplicationStatus);

// Send training notification
router.post("/admin/:id/training-notification", authenticateToken, async (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Access denied. Admin role required.",
    });
  }
  next();
}, sendTrainingNotification);

// Bulk send training notifications
router.post("/admin/bulk-training-notification", authenticateToken, async (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Access denied. Admin role required.",
    });
  }
  next();
}, bulkSendTrainingNotifications);

// Update training status
router.put("/admin/:id/training-status", authenticateToken, async (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Access denied. Admin role required.",
    });
  }
  next();
}, updateTrainingStatus);

export default router;
