import { Request, Response } from "express";
import { Job, Recruiter, UserProfile } from "../models/index.js";

export const getAllJobs = async (req: Request, res: Response) => {
  try {
    const jobs = await Job.find({ isActive: true })
      .populate({
        path: "recruiterId",
        select: "companyName recruiterName recruiterEmail",
      })
      .sort({ createdAt: -1 });

    res.json({ jobs });
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

    res.json({ job });
  } catch (error) {
    console.error("Get job error:", error);
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

    const jobSkills = job.requiredSkills || [];
    
    const profiles = await UserProfile.find({
      skills: { $exists: true, $ne: [] },
    }).populate({
      path: "userId",
      select: "email",
    });

    const candidates = profiles
      .map((profile) => {
        const userSkills = profile.skills || [];
        const matchingSkills = userSkills.filter((skill: string) =>
          jobSkills.some(
            (jobSkill: string) => jobSkill.toLowerCase() === skill.toLowerCase()
          )
        );
        const matchScore =
          jobSkills.length > 0
            ? Math.round((matchingSkills.length / jobSkills.length) * 100)
            : 0;

        return {
          profile,
          matchScore,
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
