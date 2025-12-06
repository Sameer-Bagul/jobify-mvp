import { Router } from "express";
import { db } from "../db.js";
import { jobs, recruiters } from "../../shared/schema.js";
import { eq, desc } from "drizzle-orm";
import { authenticateToken, AuthRequest, requireRole } from "../middleware/auth.js";

const router = Router();

router.get("/profile", authenticateToken, requireRole("recruiter"), async (req: AuthRequest, res) => {
  try {
    const [recruiter] = await db.select().from(recruiters).where(eq(recruiters.userId, req.userId!));
    if (!recruiter) {
      return res.status(404).json({ error: "Recruiter profile not found" });
    }
    res.json(recruiter);
  } catch (error) {
    console.error("Get recruiter error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/profile", authenticateToken, requireRole("recruiter"), async (req: AuthRequest, res) => {
  try {
    const { companyName, recruiterName, recruiterEmail } = req.body;
    
    await db.update(recruiters)
      .set({ companyName, recruiterName, recruiterEmail })
      .where(eq(recruiters.userId, req.userId!));

    res.json({ message: "Profile updated successfully" });
  } catch (error) {
    console.error("Update recruiter error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/jobs", authenticateToken, requireRole("recruiter"), async (req: AuthRequest, res) => {
  try {
    const { title, description, requiredSkills, location, salary } = req.body;

    const [recruiter] = await db.select().from(recruiters).where(eq(recruiters.userId, req.userId!));
    if (!recruiter) {
      return res.status(404).json({ error: "Recruiter profile not found" });
    }

    const skillsArray = requiredSkills
      ? typeof requiredSkills === "string"
        ? JSON.parse(requiredSkills)
        : requiredSkills
      : [];

    const [newJob] = await db.insert(jobs).values({
      recruiterId: recruiter.id,
      title,
      description,
      requiredSkills: skillsArray,
      location,
      salary,
    }).returning();

    res.status(201).json(newJob);
  } catch (error) {
    console.error("Create job error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/jobs", authenticateToken, requireRole("recruiter"), async (req: AuthRequest, res) => {
  try {
    const [recruiter] = await db.select().from(recruiters).where(eq(recruiters.userId, req.userId!));
    if (!recruiter) {
      return res.status(404).json({ error: "Recruiter profile not found" });
    }

    const recruiterJobs = await db
      .select()
      .from(jobs)
      .where(eq(jobs.recruiterId, recruiter.id))
      .orderBy(desc(jobs.createdAt));

    res.json(recruiterJobs);
  } catch (error) {
    console.error("Get recruiter jobs error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/jobs/:id", authenticateToken, requireRole("recruiter"), async (req: AuthRequest, res) => {
  try {
    const { title, description, requiredSkills, location, salary, isActive } = req.body;
    const jobId = parseInt(req.params.id);

    const [recruiter] = await db.select().from(recruiters).where(eq(recruiters.userId, req.userId!));
    if (!recruiter) {
      return res.status(404).json({ error: "Recruiter profile not found" });
    }

    const [job] = await db.select().from(jobs).where(eq(jobs.id, jobId));
    if (!job || job.recruiterId !== recruiter.id) {
      return res.status(404).json({ error: "Job not found or access denied" });
    }

    const skillsArray = requiredSkills
      ? typeof requiredSkills === "string"
        ? JSON.parse(requiredSkills)
        : requiredSkills
      : undefined;

    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (skillsArray !== undefined) updateData.requiredSkills = skillsArray;
    if (location !== undefined) updateData.location = location;
    if (salary !== undefined) updateData.salary = salary;
    if (isActive !== undefined) updateData.isActive = isActive;

    await db.update(jobs).set(updateData).where(eq(jobs.id, jobId));

    res.json({ message: "Job updated successfully" });
  } catch (error) {
    console.error("Update job error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/jobs/:id", authenticateToken, requireRole("recruiter"), async (req: AuthRequest, res) => {
  try {
    const jobId = parseInt(req.params.id);

    const [recruiter] = await db.select().from(recruiters).where(eq(recruiters.userId, req.userId!));
    if (!recruiter) {
      return res.status(404).json({ error: "Recruiter profile not found" });
    }

    const [job] = await db.select().from(jobs).where(eq(jobs.id, jobId));
    if (!job || job.recruiterId !== recruiter.id) {
      return res.status(404).json({ error: "Job not found or access denied" });
    }

    await db.update(jobs).set({ isActive: false }).where(eq(jobs.id, jobId));

    res.json({ message: "Job deleted successfully" });
  } catch (error) {
    console.error("Delete job error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
