import { Response } from "express";
import { User, UserProfile, Subscription, SavedItem, ActivityLog, EmailTemplate } from "../models/index.js";
import { AuthRequest } from "../middleware/auth.js";
import { encrypt } from "../utils/encryption.js";

export const getMe = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.userId).select("-passwordHash");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const profile = await UserProfile.findOne({ userId: user._id });

    const subscription = await Subscription.findOne({
      userId: user._id,
      status: "active",
      endDate: { $gte: new Date() },
    });

    res.json({
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
      profile: profile || null,
      isSubscribed: !!subscription,
      subscription: subscription ? {
        planName: subscription.planName,
        endDate: subscription.endDate,
      } : null,
    });
  } catch (error) {
    console.error("Get me error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const completeOnboarding = async (req: AuthRequest, res: Response) => {
  try {
    const { name, phone, skills, experience, projects, education, gmailId, gmailAppPassword } = req.body;

    let profile = await UserProfile.findOne({ userId: req.userId });

    const encryptedPassword = gmailAppPassword ? encrypt(gmailAppPassword) : null;

    if (!profile) {
      profile = await UserProfile.create({
        userId: req.userId,
        name,
        phone,
        skills: skills || [],
        experience,
        projects,
        education,
        gmailId,
        gmailAppPassword: encryptedPassword,
        onboardingCompleted: true,
      });
    } else {
      profile.name = name || profile.name;
      profile.phone = phone || profile.phone;
      profile.skills = skills || profile.skills;
      profile.experience = experience || profile.experience;
      profile.projects = projects || profile.projects;
      profile.education = education || profile.education;
      profile.gmailId = gmailId || profile.gmailId;
      if (gmailAppPassword) {
        profile.gmailAppPassword = encryptedPassword!;
      }
      profile.onboardingCompleted = true;
      await profile.save();
    }

    const defaultTemplate = await EmailTemplate.findOne({ userId: req.userId, isDefault: true });
    if (!defaultTemplate) {
      await EmailTemplate.create({
        userId: req.userId,
        name: "Default Template",
        isDefault: true,
      });
    }

    await ActivityLog.create({
      userId: req.userId,
      action: "Completed onboarding",
      actionType: "profile_updated",
      details: { skills: skills?.length || 0 },
    });

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
    const { name, phone, skills, experience, projects, education, gmailId, gmailAppPassword, resumeUrl } = req.body;

    const profile = await UserProfile.findOne({ userId: req.userId });
    if (!profile) {
      return res.status(404).json({ error: "Profile not found" });
    }

    if (name !== undefined) profile.name = name;
    if (phone !== undefined) profile.phone = phone;
    if (skills !== undefined) profile.skills = skills;
    if (experience !== undefined) profile.experience = experience;
    if (projects !== undefined) profile.projects = projects;
    if (education !== undefined) profile.education = education;
    if (gmailId !== undefined) profile.gmailId = gmailId;
    if (gmailAppPassword !== undefined) {
      profile.gmailAppPassword = encrypt(gmailAppPassword);
    }
    if (resumeUrl !== undefined) profile.resumeUrl = resumeUrl;

    await profile.save();

    await ActivityLog.create({
      userId: req.userId,
      action: "Updated profile",
      actionType: "profile_updated",
      details: {},
    });

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

export const getSavedItems = async (req: AuthRequest, res: Response) => {
  try {
    const { type } = req.query;
    
    const query: any = { userId: req.userId };
    if (type) query.itemType = type;

    const savedItems = await SavedItem.find(query)
      .sort({ createdAt: -1 });

    const populatedItems = await Promise.all(
      savedItems.map(async (item) => {
        let itemData;
        if (item.itemType === "job") {
          const Job = (await import("../models/Job.js")).default;
          itemData = await Job.findById(item.itemId).populate("recruiterId", "companyName");
        } else {
          const Recruiter = (await import("../models/Recruiter.js")).default;
          itemData = await Recruiter.findById(item.itemId);
        }
        return {
          ...item.toObject(),
          item: itemData,
        };
      })
    );

    res.json({ savedItems: populatedItems });
  } catch (error) {
    console.error("Get saved items error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const saveItem = async (req: AuthRequest, res: Response) => {
  try {
    const { itemType, itemId, notes } = req.body;

    if (!itemType || !itemId) {
      return res.status(400).json({ error: "Item type and ID are required" });
    }

    const existing = await SavedItem.findOne({
      userId: req.userId,
      itemId,
    });

    if (existing) {
      return res.status(400).json({ error: "Item already saved" });
    }

    const savedItem = await SavedItem.create({
      userId: req.userId,
      itemType,
      itemId,
      notes,
    });

    await ActivityLog.create({
      userId: req.userId,
      action: `Saved ${itemType}`,
      actionType: itemType === "job" ? "job_saved" : "recruiter_saved",
      details: { itemId },
    });

    res.status(201).json({
      message: "Item saved successfully",
      savedItem,
    });
  } catch (error) {
    console.error("Save item error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const unsaveItem = async (req: AuthRequest, res: Response) => {
  try {
    const { itemId } = req.params;

    const result = await SavedItem.findOneAndDelete({
      userId: req.userId,
      itemId,
    });

    if (!result) {
      return res.status(404).json({ error: "Saved item not found" });
    }

    res.json({ message: "Item removed from saved" });
  } catch (error) {
    console.error("Unsave item error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getActivityTimeline = async (req: AuthRequest, res: Response) => {
  try {
    const { limit = 20 } = req.query;

    const activities = await ActivityLog.find({ userId: req.userId })
      .sort({ timestamp: -1 })
      .limit(Number(limit));

    res.json({ activities });
  } catch (error) {
    console.error("Get activity timeline error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
