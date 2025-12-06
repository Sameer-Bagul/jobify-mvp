import { Router } from "express";
import { authenticateToken, requireRole } from "../middleware/auth.js";
import { getEmailStats, sendEmail, getEmailLogs } from "../controllers/emailController.js";

const router = Router();

router.get("/stats", authenticateToken, requireRole("seeker"), getEmailStats);
router.post("/send", authenticateToken, requireRole("seeker"), sendEmail);
router.get("/logs", authenticateToken, requireRole("seeker"), getEmailLogs);

export default router;
