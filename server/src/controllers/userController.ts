import { Response } from "express";
import { User, UserProfile } from "../models/index.js";
import { AuthRequest } from "../middleware/auth.js";

export const getMe = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.userId).select("-passwordHash");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const profile = await UserProfile.findOne({ userId: user._id });

    res.json({
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
      profile: profile || null,
    });
  } catch (error) {
    console.error("Get me error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const completeOnboarding = async (req: AuthRequest, res: Response) => {
  try {
    const { name, skills, experience, gmailId, gmailAppPassword } = req.body;

    let profile = await UserProfile.findOne({ userId: req.userId });

    if (!profile) {
      profile = await UserProfile.create({
        userId: req.userId,
        name,
        skills: skills || [],
        experience,
        gmailId,
        gmailAppPassword,
      });
    } else {
      profile.name = name || profile.name;
      profile.skills = skills || profile.skills;
      profile.experience = experience || profile.experience;
      profile.gmailId = gmailId || profile.gmailId;
      profile.gmailAppPassword = gmailAppPassword || profile.gmailAppPassword;
      await profile.save();
    }

    res.json({
      message: "Onboarding completed successfully",
      profile,
    });
  } catch (error) {
    console.error("Onboarding error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    const { name, skills, experience, gmailId, gmailAppPassword, resumeUrl } = req.body;

    const profile = await UserProfile.findOne({ userId: req.userId });
    if (!profile) {
      return res.status(404).json({ error: "Profile not found" });
    }

    if (name !== undefined) profile.name = name;
    if (skills !== undefined) profile.skills = skills;
    if (experience !== undefined) profile.experience = experience;
    if (gmailId !== undefined) profile.gmailId = gmailId;
    if (gmailAppPassword !== undefined) profile.gmailAppPassword = gmailAppPassword;
    if (resumeUrl !== undefined) profile.resumeUrl = resumeUrl;

    await profile.save();

    res.json({
      message: "Profile updated successfully",
      profile,
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const uploadResume = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const resumeUrl = `/uploads/${req.file.filename}`;
    
    const profile = await UserProfile.findOne({ userId: req.userId });
    if (!profile) {
      return res.status(404).json({ error: "Profile not found" });
    }

    profile.resumeUrl = resumeUrl;
    await profile.save();

    res.json({
      message: "Resume uploaded successfully",
      resumeUrl,
    });
  } catch (error) {
    console.error("Upload resume error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
