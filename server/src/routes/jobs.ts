import { Router } from "express";
import { authenticateToken } from "../middleware/auth.js";
import {
  getAllJobs,
  getJobById,
  getJobsWithMatchScore,
  getJobMatchScore,
  getMatchingCandidates,
  getJobFilters,
} from "../controllers/jobController.js";

const router = Router();

router.get("/", getAllJobs);
router.get("/filters", getJobFilters);
router.get("/with-match-score", authenticateToken, getJobsWithMatchScore);
router.get("/:id", getJobById);
router.get("/:id/match-score", authenticateToken, getJobMatchScore);
router.get("/match/:jobId", authenticateToken, getMatchingCandidates);

export default router;
