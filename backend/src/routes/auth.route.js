import express from "express";
import { authenticateToken } from "../middleware/auth.middleware.js";
import {
  getProfile,
  login,
  logout,
  resendVerificationEmail,
  signup,
  verifyEmail,
} from "../controllers/auth.controller.js";

const router = express.Router();

// Public routes
router.post("/signup", signup);
router.post("/login", login);
router.post("/resend-verification", resendVerificationEmail);
router.get("/verify-email/:token", verifyEmail);

// Protected routes
router.get("/profile", authenticateToken, getProfile);
router.post("/logout", authenticateToken, logout);

export default router;
