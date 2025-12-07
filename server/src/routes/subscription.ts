import { Router } from "express";
import { authenticateToken, requireRole } from "../middleware/auth.js";
import {
  getSubscriptionStatus,
  createSubscriptionOrder,
  verifySubscriptionPayment,
  getSubscriptionHistory,
  getAvailablePlans,
} from "../controllers/subscriptionController.js";

const router = Router();

router.get("/plans", getAvailablePlans);
router.get("/status", authenticateToken, requireRole("seeker"), getSubscriptionStatus);
router.post("/create-order", authenticateToken, requireRole("seeker"), createSubscriptionOrder);
router.post("/verify-payment", authenticateToken, requireRole("seeker"), verifySubscriptionPayment);
router.get("/history", authenticateToken, requireRole("seeker"), getSubscriptionHistory);

export default router;
