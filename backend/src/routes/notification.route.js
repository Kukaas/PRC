import express from "express";
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  updatePreferences,
  getPreferences,
  cleanupNotifications
} from "../controllers/notification.controller.js";
import { authenticateToken } from "../middleware/auth.middleware.js";

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Get user notifications
router.get("/", getNotifications);

// Mark notification as read
router.patch("/:notificationId/read", markAsRead);

// Mark all notifications as read
router.patch("/mark-all-read", markAllAsRead);

// Update notification preferences
router.put("/preferences", updatePreferences);

// Get notification preferences
router.get("/preferences", getPreferences);

// Cleanup expired notifications (admin only)
router.delete("/cleanup", cleanupNotifications);

export default router;
