import express from "express";
import { authenticateToken } from "../middleware/auth.middleware.js";
import {
  updateProfile,
  getProfileCompletionStatus,
  getProfileSetupStatus,
} from "../controllers/profile.controller.js";

const router = express.Router();

// All profile routes require authentication
router.use(authenticateToken);

// Profile routes
router.put("/update", updateProfile);
router.get("/completion-status", getProfileCompletionStatus);
router.get("/setup-status", getProfileSetupStatus);

export default router;
