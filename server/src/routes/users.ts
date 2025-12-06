import { Router } from "express";
import multer from "multer";
import path from "path";
import { db } from "../db.js";
import { userProfiles, users } from "../../shared/schema.js";
import { eq } from "drizzle-orm";
import { authenticateToken, AuthRequest } from "../middleware/auth.js";

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
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed"));
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 },
});

router.get("/me", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const [user] = await db.select().from(users).where(eq(users.id, req.userId!));
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const [profile] = await db.select().from(userProfiles).where(eq(userProfiles.userId, req.userId!));

    res.json({
      user: { id: user.id, email: user.email, role: user.role },
      profile: profile || null,
    });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/onboarding", authenticateToken, upload.single("resume"), async (req: AuthRequest, res) => {
  try {
    const { name, skills, experience, gmailId, gmailAppPassword } = req.body;
    const resumeUrl = req.file ? `/uploads/${req.file.filename}` : null;

    const skillsArray = skills ? (typeof skills === "string" ? JSON.parse(skills) : skills) : [];

    const [existingProfile] = await db.select().from(userProfiles).where(eq(userProfiles.userId, req.userId!));

    if (existingProfile) {
      await db.update(userProfiles)
        .set({
          name,
          skills: skillsArray,
          experience,
          gmailId,
          gmailAppPassword,
          resumeUrl: resumeUrl || existingProfile.resumeUrl,
        })
        .where(eq(userProfiles.userId, req.userId!));
    } else {
      await db.insert(userProfiles).values({
        userId: req.userId!,
        name,
        skills: skillsArray,
        experience,
        gmailId,
        gmailAppPassword,
        resumeUrl,
      });
    }

    res.json({ message: "Onboarding completed successfully" });
  } catch (error) {
    console.error("Onboarding error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/profile", authenticateToken, upload.single("resume"), async (req: AuthRequest, res) => {
  try {
    const { name, skills, experience, gmailId, gmailAppPassword } = req.body;
    const resumeUrl = req.file ? `/uploads/${req.file.filename}` : undefined;

    const skillsArray = skills ? (typeof skills === "string" ? JSON.parse(skills) : skills) : undefined;

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (skillsArray !== undefined) updateData.skills = skillsArray;
    if (experience !== undefined) updateData.experience = experience;
    if (gmailId !== undefined) updateData.gmailId = gmailId;
    if (gmailAppPassword !== undefined) updateData.gmailAppPassword = gmailAppPassword;
    if (resumeUrl) updateData.resumeUrl = resumeUrl;

    await db.update(userProfiles)
      .set(updateData)
      .where(eq(userProfiles.userId, req.userId!));

    res.json({ message: "Profile updated successfully" });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
