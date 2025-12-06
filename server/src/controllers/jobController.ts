import { Request, Response } from "express";
import { Job, Recruiter, UserProfile, SavedItem, ActivityLog } from "../models/index.js";
import { AuthRequest } from "../middleware/auth.js";
import { calculateMatchScore, getMatchCategory } from "../utils/matchingScore.js";

export const getAllJobs = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 20, skill, location, company, jobType, experienceLevel, search } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const query: any = { isActive: true };

    if (skill) {
      query.requiredSkills = { $regex: skill, $options: "i" };
    }
    if (location) {
      query.location = { $regex: location, $options: "i" };
    }
    if (company) {
      query.company = { $regex: company, $options: "i" };
    }
    if (jobType) {
      query.jobType = jobType;
    }
    if (experienceLevel) {
      query.experienceLevel = experienceLevel;
    }
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { company: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const jobs = await Job.find(query)
      .populate({
        path: "recruiterId",
        select: "companyName recruiterName recruiterEmail",
      })
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const total = await Job.countDocuments(query);

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
    console.error("Get jobs error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getJobById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const job = await Job.findById(id).populate({
      path: "recruiterId",
      select: "companyName recruiterName recruiterEmail",
    });

    if (!job) {
      return res.status(404).json({ error: "Job not found" });
    }

    job.viewCount = (job.viewCount || 0) + 1;
    await job.save();

    res.json({ job });
  } catch (error) {
    console.error("Get job error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getJobsWithMatchScore = async (req: AuthRequest, res: Response) => {
  try {
    const { page = 1, limit = 20, skill, location, company, minScore = 0 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const profile = await UserProfile.findOne({ userId: req.userId });
    if (!profile) {
      return res.status(404).json({ error: "Profile not found" });
    }

    const query: any = { isActive: true };
    if (skill) query.requiredSkills = { $regex: skill, $options: "i" };
    if (location) query.location = { $regex: location, $options: "i" };
    if (company) query.company = { $regex: company, $options: "i" };

    const jobs = await Job.find(query)
      .populate({
        path: "recruiterId",
        select: "companyName recruiterName recruiterEmail",
      })
      .sort({ createdAt: -1 });

    const savedJobIds = await SavedItem.find({
      userId: req.userId,
      itemType: "job",
    }).distinct("itemId");

    const jobsWithScore = jobs.map((job) => {
      const matchScore = calculateMatchScore(
        { skills: profile.skills || [], experience: profile.experience },
        { requiredSkills: job.requiredSkills || [], experienceLevel: job.experienceLevel }
      );
      return {
        ...job.toObject(),
        matchScore,
        matchCategory: getMatchCategory(matchScore),
        isSaved: savedJobIds.some((id) => id.toString() === job._id.toString()),
      };
    });

    const filteredJobs = jobsWithScore
      .filter((job) => job.matchScore >= Number(minScore))
      .sort((a, b) => b.matchScore - a.matchScore);

    const paginatedJobs = filteredJobs.slice(skip, skip + Number(limit));

    res.json({
      jobs: paginatedJobs,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: filteredJobs.length,
        pages: Math.ceil(filteredJobs.length / Number(limit)),
      },
    });
  } catch (error) {
    console.error("Get jobs with match score error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getJobMatchScore = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const profile = await UserProfile.findOne({ userId: req.userId });
    if (!profile) {
      return res.status(404).json({ error: "Profile not found" });
    }

    const job = await Job.findById(id);
    if (!job) {
      return res.status(404).json({ error: "Job not found" });
    }

    const matchScore = calculateMatchScore(
      { skills: profile.skills || [], experience: profile.experience },
      { requiredSkills: job.requiredSkills || [], experienceLevel: job.experienceLevel }
    );

    const matchingSkills = (profile.skills || []).filter((skill) =>
      (job.requiredSkills || []).some(
        (reqSkill) => reqSkill.toLowerCase().includes(skill.toLowerCase()) ||
                      skill.toLowerCase().includes(reqSkill.toLowerCase())
      )
    );

    const missingSkills = (job.requiredSkills || []).filter((reqSkill) =>
      !(profile.skills || []).some(
        (skill) => skill.toLowerCase().includes(reqSkill.toLowerCase()) ||
                   reqSkill.toLowerCase().includes(skill.toLowerCase())
      )
    );

    await ActivityLog.create({
      userId: req.userId,
      action: `Viewed job: ${job.title}`,
      actionType: "job_viewed",
      details: { jobId: job._id, matchScore },
    });

    res.json({
      matchScore,
      matchCategory: getMatchCategory(matchScore),
      matchingSkills,
      missingSkills,
      totalRequired: job.requiredSkills?.length || 0,
      totalMatched: matchingSkills.length,
    });
  } catch (error) {
    console.error("Get job match score error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getMatchingCandidates = async (req: Request, res: Response) => {
  try {
    const { jobId } = req.params;

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ error: "Job not found" });
    }

    const profiles = await UserProfile.find({
      skills: { $exists: true, $ne: [] },
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
            (jobSkill: string) => jobSkill.toLowerCase().includes(skill.toLowerCase())
          )
        );

        return {
          profile: {
            id: profile._id,
            name: profile.name,
            email: (profile.userId as any)?.email,
            skills: profile.skills,
            experience: profile.experience,
            resumeUrl: profile.resumeUrl,
          },
          matchScore,
          matchCategory: getMatchCategory(matchScore),
          matchingSkills,
        };
      })
      .filter((candidate) => candidate.matchScore > 0)
      .sort((a, b) => b.matchScore - a.matchScore);

    res.json({ candidates });
  } catch (error) {
    console.error("Get matching candidates error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getJobFilters = async (req: Request, res: Response) => {
  try {
    const locations = await Job.distinct("location", { isActive: true, location: { $ne: null } });
    const companies = await Job.distinct("company", { isActive: true });
    const skills = await Job.distinct("requiredSkills", { isActive: true });
    const jobTypes = ["full-time", "part-time", "contract", "internship", "remote"];
    const experienceLevels = ["entry", "mid", "senior", "lead"];

    res.json({
      filters: {
        locations: locations.filter(Boolean).sort(),
        companies: companies.filter(Boolean).sort(),
        skills: skills.filter(Boolean).sort(),
        jobTypes,
        experienceLevels,
      },
    });
  } catch (error) {
    console.error("Get job filters error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
