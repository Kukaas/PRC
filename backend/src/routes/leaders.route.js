import express from "express";
import { authenticateToken } from "../middleware/auth.middleware.js";
import {
  createLeader,
  getLeaders,
  getLeaderById,
  updateLeader,
  deleteLeader,
  notifyLeader,
  bulkNotifyLeaders,
} from "../controllers/leaders.controller.js";

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Admin guard middleware
const requireAdmin = async (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ success: false, message: "Access denied. Admin role required." });
  }
  next();
};

// CRUD
router.post("/admin", requireAdmin, createLeader);
router.get("/admin", requireAdmin, getLeaders);
router.get("/admin/:id", requireAdmin, getLeaderById);
router.put("/admin/:id", requireAdmin, updateLeader);
router.delete("/admin/:id", requireAdmin, deleteLeader);

// Notifications
router.post("/admin/:id/notify", requireAdmin, notifyLeader);
router.post("/admin/bulk-notify", requireAdmin, bulkNotifyLeaders);

export default router;


