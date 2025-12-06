import { Router } from "express";
import { db } from "../db.js";
import { jobs, recruiters, userProfiles } from "../../shared/schema.js";
import { eq, desc } from "drizzle-orm";
import { authenticateToken, AuthRequest, requireRole } from "../middleware/auth.js";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const allJobs = await db
      .select({
        id: jobs.id,
        title: jobs.title,
        description: jobs.description,
        requiredSkills: jobs.requiredSkills,
        location: jobs.location,
        salary: jobs.salary,
        isActive: jobs.isActive,
        createdAt: jobs.createdAt,
        companyName: recruiters.companyName,
        recruiterName: recruiters.recruiterName,
        recruiterEmail: recruiters.recruiterEmail,
      })
      .from(jobs)
      .leftJoin(recruiters, eq(jobs.recruiterId, recruiters.id))
      .where(eq(jobs.isActive, true))
      .orderBy(desc(jobs.createdAt));

    res.json(allJobs);
  } catch (error) {
    console.error("Get jobs error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const [job] = await db
      .select({
        id: jobs.id,
        title: jobs.title,
        description: jobs.description,
        requiredSkills: jobs.requiredSkills,
        location: jobs.location,
        salary: jobs.salary,
        isActive: jobs.isActive,
        createdAt: jobs.createdAt,
        companyName: recruiters.companyName,
        recruiterName: recruiters.recruiterName,
        recruiterEmail: recruiters.recruiterEmail,
      })
      .from(jobs)
      .leftJoin(recruiters, eq(jobs.recruiterId, recruiters.id))
      .where(eq(jobs.id, parseInt(req.params.id)));

    if (!job) {
      return res.status(404).json({ error: "Job not found" });
    }

    res.json(job);
  } catch (error) {
    console.error("Get job error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/match/:jobId", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const [job] = await db.select().from(jobs).where(eq(jobs.id, parseInt(req.params.jobId)));
    if (!job) {
      return res.status(404).json({ error: "Job not found" });
    }

    const candidates = await db.select().from(userProfiles);
    
    const matchedCandidates = candidates.map((candidate) => {
      const candidateSkills = (candidate.skills as string[]) || [];
      const jobSkills = (job.requiredSkills as string[]) || [];
      
      const matchingSkills = candidateSkills.filter((skill) =>
        jobSkills.some((jobSkill) => 
          skill.toLowerCase().includes(jobSkill.toLowerCase()) ||
          jobSkill.toLowerCase().includes(skill.toLowerCase())
        )
      );
      
      const matchScore = jobSkills.length > 0
        ? Math.round((matchingSkills.length / jobSkills.length) * 100)
        : 0;

      return {
        ...candidate,
        matchScore,
        matchingSkills,
      };
    });

    matchedCandidates.sort((a, b) => b.matchScore - a.matchScore);

    res.json(matchedCandidates);
  } catch (error) {
    console.error("Match candidates error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
