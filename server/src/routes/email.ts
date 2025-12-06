import { Router } from "express";
import { authenticateToken, requireRole } from "../middleware/auth.js";
import {
  getEmailStats,
  sendColdEmail,
  sendBulkEmails,
  getEmailLogs,
  getEmailTemplates,
  createEmailTemplate,
  updateEmailTemplate,
  deleteEmailTemplate,
  getAvailableRecruiters,
} from "../controllers/emailController.js";

const router = Router();

router.get("/stats", authenticateToken, requireRole("seeker"), getEmailStats);
router.post("/send", authenticateToken, requireRole("seeker"), sendColdEmail);
router.post("/bulk", authenticateToken, requireRole("seeker"), sendBulkEmails);
router.get("/logs", authenticateToken, requireRole("seeker"), getEmailLogs);

router.get("/templates", authenticateToken, requireRole("seeker"), getEmailTemplates);
router.post("/templates", authenticateToken, requireRole("seeker"), createEmailTemplate);
router.put("/templates/:id", authenticateToken, requireRole("seeker"), updateEmailTemplate);
router.delete("/templates/:id", authenticateToken, requireRole("seeker"), deleteEmailTemplate);

router.get("/recruiters", authenticateToken, requireRole("seeker"), getAvailableRecruiters);

export default router;
