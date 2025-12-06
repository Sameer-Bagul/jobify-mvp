import { Router } from "express";
import { authenticateToken, requireRole } from "../middleware/auth.js";
import {
  getRecruiterProfile,
  updateRecruiterProfile,
  createJob,
  getRecruiterJobs,
  updateJob,
  deleteJob,
} from "../controllers/recruiterController.js";

const router = Router();

router.get("/profile", authenticateToken, requireRole("recruiter"), getRecruiterProfile);
router.put("/profile", authenticateToken, requireRole("recruiter"), updateRecruiterProfile);
router.post("/jobs", authenticateToken, requireRole("recruiter"), createJob);
router.get("/jobs", authenticateToken, requireRole("recruiter"), getRecruiterJobs);
router.put("/jobs/:id", authenticateToken, requireRole("recruiter"), updateJob);
router.delete("/jobs/:id", authenticateToken, requireRole("recruiter"), deleteJob);

export default router;
