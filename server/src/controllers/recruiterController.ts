import { Response } from "express";
import { Recruiter, Job } from "../models/index.js";
import { AuthRequest } from "../middleware/auth.js";

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
    const { companyName, recruiterName, recruiterEmail } = req.body;

    const recruiter = await Recruiter.findOne({ userId: req.userId });
    if (!recruiter) {
      return res.status(404).json({ error: "Recruiter profile not found" });
    }

    if (companyName !== undefined) recruiter.companyName = companyName;
    if (recruiterName !== undefined) recruiter.recruiterName = recruiterName;
    if (recruiterEmail !== undefined) recruiter.recruiterEmail = recruiterEmail;

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
    const { title, description, requiredSkills, location, salary } = req.body;

    if (!title) {
      return res.status(400).json({ error: "Job title is required" });
    }

    const recruiter = await Recruiter.findOne({ userId: req.userId });
    if (!recruiter) {
      return res.status(404).json({ error: "Recruiter profile not found" });
    }

    const job = await Job.create({
      recruiterId: recruiter._id,
      title,
      description,
      requiredSkills: requiredSkills || [],
      location,
      salary,
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

    res.json({ jobs });
  } catch (error) {
    console.error("Get recruiter jobs error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const updateJob = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, requiredSkills, location, salary, isActive } =
      req.body;

    const recruiter = await Recruiter.findOne({ userId: req.userId });
    if (!recruiter) {
      return res.status(404).json({ error: "Recruiter profile not found" });
    }

    const job = await Job.findOne({ _id: id, recruiterId: recruiter._id });
    if (!job) {
      return res.status(404).json({ error: "Job not found" });
    }

    if (title !== undefined) job.title = title;
    if (description !== undefined) job.description = description;
    if (requiredSkills !== undefined) job.requiredSkills = requiredSkills;
    if (location !== undefined) job.location = location;
    if (salary !== undefined) job.salary = salary;
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
