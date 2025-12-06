import { Response } from "express";
import { Recruiter, Job, UserProfile } from "../models/index.js";
import { AuthRequest } from "../middleware/auth.js";
import { calculateMatchScore, getMatchCategory } from "../utils/matchingScore.js";

export const getRecruiterProfile = async (req: AuthRequest, res: Response) => {
  try {
    const recruiter = await Recruiter.findOne({ userId: req.userId });
    if (!recruiter) {
      return res.status(404).json({ error: "Recruiter profile not found" });
    }

    res.json({ recruiter });
  } catch (error) {
    console.error("Get recruiter profile error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const updateRecruiterProfile = async (req: AuthRequest, res: Response) => {
  try {
    const { companyName, recruiterName, recruiterEmail, phone, linkedinUrl, industry, location } = req.body;

    const recruiter = await Recruiter.findOne({ userId: req.userId });
    if (!recruiter) {
      return res.status(404).json({ error: "Recruiter profile not found" });
    }

    if (companyName !== undefined) recruiter.companyName = companyName;
    if (recruiterName !== undefined) recruiter.recruiterName = recruiterName;
    if (recruiterEmail !== undefined) recruiter.recruiterEmail = recruiterEmail;
    if (phone !== undefined) recruiter.phone = phone;
    if (linkedinUrl !== undefined) recruiter.linkedinUrl = linkedinUrl;
    if (industry !== undefined) recruiter.industry = industry;
    if (location !== undefined) recruiter.location = location;

    await recruiter.save();

    res.json({
      message: "Profile updated successfully",
      recruiter,
    });
  } catch (error) {
    console.error("Update recruiter profile error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const createJob = async (req: AuthRequest, res: Response) => {
  try {
    const {
      title,
      company,
      description,
      requiredSkills,
      location,
      jobType,
      experienceLevel,
      salaryMin,
      salaryMax,
      salaryCurrency,
      applicationDeadline,
    } = req.body;

    if (!title || !company) {
      return res.status(400).json({ error: "Job title and company are required" });
    }

    const recruiter = await Recruiter.findOne({ userId: req.userId });
    if (!recruiter) {
      return res.status(404).json({ error: "Recruiter profile not found" });
    }

    const job = await Job.create({
      recruiterId: recruiter._id,
      recruiterUserId: req.userId,
      title,
      company,
      description,
      requiredSkills: requiredSkills || [],
      location,
      jobType: jobType || "full-time",
      experienceLevel: experienceLevel || "mid",
      salaryMin: salaryMin || 0,
      salaryMax: salaryMax || 0,
      salaryCurrency: salaryCurrency || "INR",
      applicationDeadline: applicationDeadline ? new Date(applicationDeadline) : null,
    });

    res.status(201).json({
      message: "Job created successfully",
      job,
    });
  } catch (error) {
    console.error("Create job error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getRecruiterJobs = async (req: AuthRequest, res: Response) => {
  try {
    const recruiter = await Recruiter.findOne({ userId: req.userId });
    if (!recruiter) {
      return res.status(404).json({ error: "Recruiter profile not found" });
    }

    const jobs = await Job.find({ recruiterId: recruiter._id }).sort({
      createdAt: -1,
    });

    const jobsWithStats = jobs.map((job) => ({
      ...job.toObject(),
      stats: {
        views: job.viewCount || 0,
        applications: job.applicationCount || 0,
      },
    }));

    res.json({ jobs: jobsWithStats });
  } catch (error) {
    console.error("Get recruiter jobs error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getRecruiterJobById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const recruiter = await Recruiter.findOne({ userId: req.userId });
    if (!recruiter) {
      return res.status(404).json({ error: "Recruiter profile not found" });
    }

    const job = await Job.findOne({ _id: id, recruiterId: recruiter._id });
    if (!job) {
      return res.status(404).json({ error: "Job not found" });
    }

    res.json({ job });
  } catch (error) {
    console.error("Get job by id error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const updateJob = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const {
      title,
      company,
      description,
      requiredSkills,
      location,
      jobType,
      experienceLevel,
      salaryMin,
      salaryMax,
      salaryCurrency,
      applicationDeadline,
      isActive,
    } = req.body;

    const recruiter = await Recruiter.findOne({ userId: req.userId });
    if (!recruiter) {
      return res.status(404).json({ error: "Recruiter profile not found" });
    }

    const job = await Job.findOne({ _id: id, recruiterId: recruiter._id });
    if (!job) {
      return res.status(404).json({ error: "Job not found" });
    }

    if (title !== undefined) job.title = title;
    if (company !== undefined) job.company = company;
    if (description !== undefined) job.description = description;
    if (requiredSkills !== undefined) job.requiredSkills = requiredSkills;
    if (location !== undefined) job.location = location;
    if (jobType !== undefined) job.jobType = jobType;
    if (experienceLevel !== undefined) job.experienceLevel = experienceLevel;
    if (salaryMin !== undefined) job.salaryMin = salaryMin;
    if (salaryMax !== undefined) job.salaryMax = salaryMax;
    if (salaryCurrency !== undefined) job.salaryCurrency = salaryCurrency;
    if (applicationDeadline !== undefined) job.applicationDeadline = new Date(applicationDeadline);
    if (isActive !== undefined) job.isActive = isActive;

    await job.save();

    res.json({
      message: "Job updated successfully",
      job,
    });
  } catch (error) {
    console.error("Update job error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const deleteJob = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const recruiter = await Recruiter.findOne({ userId: req.userId });
    if (!recruiter) {
      return res.status(404).json({ error: "Recruiter profile not found" });
    }

    const job = await Job.findOne({ _id: id, recruiterId: recruiter._id });
    if (!job) {
      return res.status(404).json({ error: "Job not found" });
    }

    job.isActive = false;
    await job.save();

    res.json({ message: "Job deleted successfully" });
  } catch (error) {
    console.error("Delete job error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getJobCandidates = async (req: AuthRequest, res: Response) => {
  try {
    const { jobId } = req.params;

    const recruiter = await Recruiter.findOne({ userId: req.userId });
    if (!recruiter) {
      return res.status(404).json({ error: "Recruiter profile not found" });
    }

    const job = await Job.findOne({ _id: jobId, recruiterId: recruiter._id });
    if (!job) {
      return res.status(404).json({ error: "Job not found" });
    }

    const profiles = await UserProfile.find({
      skills: { $exists: true, $ne: [] },
      onboardingCompleted: true,
    }).populate({
      path: "userId",
      select: "email",
    });

    const candidates = profiles
      .map((profile) => {
        const matchScore = calculateMatchScore(
          { skills: profile.skills || [], experience: profile.experience },
          { requiredSkills: job.requiredSkills || [], experienceLevel: job.experienceLevel }
        );

        const matchingSkills = (profile.skills || []).filter((skill: string) =>
          (job.requiredSkills || []).some(
            (jobSkill: string) =>
              jobSkill.toLowerCase().includes(skill.toLowerCase()) ||
              skill.toLowerCase().includes(jobSkill.toLowerCase())
          )
        );

        return {
          id: profile._id,
          name: profile.name,
          email: (profile.userId as any)?.email,
          skills: profile.skills,
          experience: profile.experience,
          resumeUrl: profile.resumeUrl,
          matchScore,
          matchCategory: getMatchCategory(matchScore),
          matchingSkills,
        };
      })
      .filter((c) => c.matchScore > 0)
      .sort((a, b) => b.matchScore - a.matchScore);

    res.json({ candidates, totalMatched: candidates.length });
  } catch (error) {
    console.error("Get job candidates error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getRecruiterDashboardStats = async (req: AuthRequest, res: Response) => {
  try {
    const recruiter = await Recruiter.findOne({ userId: req.userId });
    if (!recruiter) {
      return res.status(404).json({ error: "Recruiter profile not found" });
    }

    const totalJobs = await Job.countDocuments({ recruiterId: recruiter._id });
    const activeJobs = await Job.countDocuments({ recruiterId: recruiter._id, isActive: true });
    
    const jobs = await Job.find({ recruiterId: recruiter._id });
    const totalViews = jobs.reduce((sum, job) => sum + (job.viewCount || 0), 0);
    const totalApplications = jobs.reduce((sum, job) => sum + (job.applicationCount || 0), 0);

    res.json({
      stats: {
        totalJobs,
        activeJobs,
        totalViews,
        totalApplications,
      },
    });
  } catch (error) {
    console.error("Get recruiter dashboard stats error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
