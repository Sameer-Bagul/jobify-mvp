import { Router } from "express";
import { signup, login, forgotPassword, verifyOTP, resetPassword, changePassword } from "../controllers/authController.js";
import { authenticateToken } from "../middleware/auth.js";

const router = Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/verify-otp", verifyOTP);
router.post("/reset-password", resetPassword);
router.post("/change-password", authenticateToken, changePassword);

export default router;
