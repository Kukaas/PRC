import express from "express";
import {
  createSkill,
  getAllSkills,
  updateSkill,
  deleteSkill,
  createService,
  getAllServices,
  updateService,
  deleteService,
  getActiveSkills,
  getActiveServices,
} from "../controllers/maintenance.controller.js";
import { authenticateToken } from "../middleware/auth.middleware.js";

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Skills routes
router.post("/skills", createSkill);
router.get("/skills", getAllSkills);
router.get("/skills/active", getActiveSkills);
router.put("/skills/:id", updateSkill);
router.delete("/skills/:id", deleteSkill);

// Services routes
router.post("/services", createService);
router.get("/services", getAllServices);
router.get("/services/active", getActiveServices);
router.put("/services/:id", updateService);
router.delete("/services/:id", deleteService);

export default router;
