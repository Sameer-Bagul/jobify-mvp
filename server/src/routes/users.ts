import { Router } from "express";
import multer from "multer";
import path from "path";
import { authenticateToken, requireRole } from "../middleware/auth.js";
import {
  getMe,
  completeOnboarding,
  updateProfile,
  uploadResume,
} from "../controllers/userController.js";

const router = Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [".pdf", ".doc", ".docx"];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error("Only PDF, DOC, and DOCX files are allowed"));
    }
  },
});

router.get("/me", authenticateToken, getMe);
router.post("/onboarding", authenticateToken, requireRole("seeker"), completeOnboarding);
router.put("/profile", authenticateToken, requireRole("seeker"), updateProfile);
router.post(
  "/upload-resume",
  authenticateToken,
  requireRole("seeker"),
  upload.single("resume"),
  uploadResume
);

export default router;
