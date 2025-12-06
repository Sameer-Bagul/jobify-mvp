import { Router } from "express";
import { authenticateToken, requireRole } from "../middleware/auth.js";
import {
  getRecruiterProfile,
  updateRecruiterProfile,
  createJob,
  getRecruiterJobs,
  getRecruiterJobById,
  updateJob,
  deleteJob,
  getJobCandidates,
  getRecruiterDashboardStats,
} from "../controllers/recruiterController.js";

const router = Router();

router.get("/profile", authenticateToken, requireRole("recruiter"), getRecruiterProfile);
router.put("/profile", authenticateToken, requireRole("recruiter"), updateRecruiterProfile);
router.get("/dashboard", authenticateToken, requireRole("recruiter"), getRecruiterDashboardStats);

router.post("/jobs", authenticateToken, requireRole("recruiter"), createJob);
router.get("/jobs", authenticateToken, requireRole("recruiter"), getRecruiterJobs);
router.get("/jobs/:id", authenticateToken, requireRole("recruiter"), getRecruiterJobById);
router.put("/jobs/:id", authenticateToken, requireRole("recruiter"), updateJob);
router.delete("/jobs/:id", authenticateToken, requireRole("recruiter"), deleteJob);
router.get("/jobs/:jobId/candidates", authenticateToken, requireRole("recruiter"), getJobCandidates);

export default router;
