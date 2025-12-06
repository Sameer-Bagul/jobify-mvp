import { Router } from "express";
import { authenticateToken, requireRole } from "../middleware/auth.js";
import {
  getDashboardStats,
  getAllUsers,
  banUser,
  deleteUser,
  getAdminJobs,
  getAllEmailLogs,
  getInternalRecruiters,
  addInternalRecruiter,
  updateInternalRecruiter,
  deleteInternalRecruiter,
  getSettings,
  updateSettings,
} from "../controllers/adminController.js";

const router = Router();

router.get("/dashboard", authenticateToken, requireRole("admin"), getDashboardStats);

router.get("/users", authenticateToken, requireRole("admin"), getAllUsers);
router.post("/users/:userId/ban", authenticateToken, requireRole("admin"), banUser);
router.delete("/users/:userId", authenticateToken, requireRole("admin"), deleteUser);

router.get("/jobs", authenticateToken, requireRole("admin"), getAdminJobs);

router.get("/email-logs", authenticateToken, requireRole("admin"), getAllEmailLogs);

router.get("/recruiters", authenticateToken, requireRole("admin"), getInternalRecruiters);
router.post("/recruiters", authenticateToken, requireRole("admin"), addInternalRecruiter);
router.put("/recruiters/:id", authenticateToken, requireRole("admin"), updateInternalRecruiter);
router.delete("/recruiters/:id", authenticateToken, requireRole("admin"), deleteInternalRecruiter);

router.get("/settings", authenticateToken, requireRole("admin"), getSettings);
router.put("/settings", authenticateToken, requireRole("admin"), updateSettings);

export default router;
