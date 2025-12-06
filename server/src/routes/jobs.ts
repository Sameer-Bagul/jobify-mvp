import { Router } from "express";
import { authenticateToken } from "../middleware/auth.js";
import { getAllJobs, getJobById, getMatchingCandidates } from "../controllers/jobController.js";

const router = Router();

router.get("/", getAllJobs);
router.get("/:id", getJobById);
router.get("/match/:jobId", authenticateToken, getMatchingCandidates);

export default router;
