import { Response } from "express";
import { User, UserProfile, Job, Recruiter, ColdEmailLog, Subscription, AdminSettings, DEFAULT_SETTINGS } from "../models/index.js";
import { AuthRequest } from "../middleware/auth.js";

export const getDashboardStats = async (req: AuthRequest, res: Response) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalSeekers = await User.countDocuments({ role: "seeker" });
    const totalRecruiters = await User.countDocuments({ role: "recruiter" });
    const totalJobs = await Job.countDocuments();
    const activeJobs = await Job.countDocuments({ isActive: true });
    const totalEmailsSent = await ColdEmailLog.countDocuments({ status: "sent" });
    const activeSubscriptions = await Subscription.countDocuments({ status: "active" });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const emailsSentToday = await ColdEmailLog.countDocuments({
      status: "sent",
      timestamp: { $gte: today },
    });

    const newUsersToday = await User.countDocuments({
      createdAt: { $gte: today },
    });

    res.json({
      stats: {
        totalUsers,
        totalSeekers,
        totalRecruiters,
        totalJobs,
        activeJobs,
        totalEmailsSent,
        emailsSentToday,
        activeSubscriptions,
        newUsersToday,
      },
    });
  } catch (error) {
    console.error("Get dashboard stats error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getAllUsers = async (req: AuthRequest, res: Response) => {
  try {
    const { page = 1, limit = 20, role, search } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const query: any = {};
    if (role) query.role = role;
    if (search) {
      query.email = { $regex: search, $options: "i" };
    }

    const users = await User.find(query)
      .select("-passwordHash")
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    res.json({
      users,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error("Get all users error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const banUser = async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;
    const { banned } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (user.role === "admin") {
      return res.status(400).json({ error: "Cannot ban admin users" });
    }

    user.isBanned = banned;
    await user.save();

    res.json({
      message: banned ? "User banned successfully" : "User unbanned successfully",
      user: { id: user._id, email: user.email, isBanned: user.isBanned },
    });
  } catch (error) {
    console.error("Ban user error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const deleteUser = async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (user.role === "admin") {
      return res.status(400).json({ error: "Cannot delete admin users" });
    }

    await UserProfile.deleteOne({ userId });
    await Recruiter.deleteOne({ userId });
    await ColdEmailLog.deleteMany({ userId });
    await Subscription.deleteMany({ userId });
    await User.deleteOne({ _id: userId });

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getAllJobs = async (req: AuthRequest, res: Response) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const jobs = await Job.find()
      .populate("recruiterId", "companyName recruiterName")
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const total = await Job.countDocuments();

    res.json({
      jobs,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error("Get all jobs error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getAllEmailLogs = async (req: AuthRequest, res: Response) => {
  try {
    const { page = 1, limit = 50, status, date } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const query: any = {};
    if (status) query.status = status;
    if (date) {
      const startDate = new Date(date as string);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(date as string);
      endDate.setHours(23, 59, 59, 999);
      query.timestamp = { $gte: startDate, $lte: endDate };
    }

    const logs = await ColdEmailLog.find(query)
      .populate("userId", "email")
      .skip(skip)
      .limit(Number(limit))
      .sort({ timestamp: -1 });

    const total = await ColdEmailLog.countDocuments(query);

    res.json({
      logs,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error("Get all email logs error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getInternalRecruiters = async (req: AuthRequest, res: Response) => {
  try {
    const recruiters = await Recruiter.find({ isInternal: true }).sort({ createdAt: -1 });
    res.json({ recruiters });
  } catch (error) {
    console.error("Get internal recruiters error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const addInternalRecruiter = async (req: AuthRequest, res: Response) => {
  try {
    const { recruiterName, recruiterEmail, companyName, phone, linkedinUrl, industry, location, notes } = req.body;

    if (!recruiterName || !recruiterEmail || !companyName) {
      return res.status(400).json({ error: "Name, email, and company are required" });
    }

    const recruiter = await Recruiter.create({
      recruiterName,
      recruiterEmail,
      companyName,
      phone,
      linkedinUrl,
      industry,
      location,
      notes,
      isInternal: true,
      addedBy: req.userId,
    });

    res.status(201).json({
      message: "Recruiter added successfully",
      recruiter,
    });
  } catch (error) {
    console.error("Add internal recruiter error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const updateInternalRecruiter = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const recruiter = await Recruiter.findOneAndUpdate(
      { _id: id, isInternal: true },
      updates,
      { new: true }
    );

    if (!recruiter) {
      return res.status(404).json({ error: "Recruiter not found" });
    }

    res.json({ message: "Recruiter updated successfully", recruiter });
  } catch (error) {
    console.error("Update internal recruiter error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const deleteInternalRecruiter = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const recruiter = await Recruiter.findOneAndDelete({ _id: id, isInternal: true });
    if (!recruiter) {
      return res.status(404).json({ error: "Recruiter not found" });
    }

    res.json({ message: "Recruiter deleted successfully" });
  } catch (error) {
    console.error("Delete internal recruiter error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getSettings = async (req: AuthRequest, res: Response) => {
  try {
    let settings = await AdminSettings.find();

    if (settings.length === 0) {
      const defaultSettings = Object.values(DEFAULT_SETTINGS);
      settings = await AdminSettings.insertMany(defaultSettings);
    }

    const settingsMap: Record<string, any> = {};
    settings.forEach((s) => {
      settingsMap[s.key] = s.value;
    });

    res.json({ settings: settingsMap });
  } catch (error) {
    console.error("Get settings error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const updateSettings = async (req: AuthRequest, res: Response) => {
  try {
    const { key, value } = req.body;

    if (!key) {
      return res.status(400).json({ error: "Setting key is required" });
    }

    const setting = await AdminSettings.findOneAndUpdate(
      { key },
      { value, updatedBy: req.userId },
      { new: true, upsert: true }
    );

    res.json({ message: "Setting updated successfully", setting });
  } catch (error) {
    console.error("Update settings error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
