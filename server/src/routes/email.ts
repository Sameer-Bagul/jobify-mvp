import { Router } from "express";
import nodemailer from "nodemailer";
import { db } from "../db.js";
import { userProfiles, coldEmailLogs, jobs, recruiters } from "../../shared/schema.js";
import { eq, and, sql } from "drizzle-orm";
import { authenticateToken, AuthRequest, requireRole } from "../middleware/auth.js";

const router = Router();

const DAILY_EMAIL_LIMIT = 20;

const getEmailTemplate = (userName: string, recruiterName: string, companyName: string, jobTitle: string) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <p>Hi ${recruiterName},</p>
      
      <p>I hope this email finds you well. My name is ${userName}, and I am reaching out to express my interest in the <strong>${jobTitle}</strong> position at <strong>${companyName}</strong>.</p>
      
      <p>I believe my skills and experience align well with the requirements of this role, and I am excited about the opportunity to contribute to your team.</p>
      
      <p>I have attached my resume for your review. I would welcome the chance to discuss how my background and skills would be a good fit for this position.</p>
      
      <p>Thank you for considering my application. I look forward to hearing from you.</p>
      
      <p>Best regards,<br/>
      ${userName}</p>
    </div>
  `;
};

router.get("/stats", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const [profile] = await db.select().from(userProfiles).where(eq(userProfiles.userId, req.userId!));
    
    if (!profile) {
      return res.status(404).json({ error: "Profile not found" });
    }

    const today = new Date().toISOString().split("T")[0];
    const lastResetDate = profile.lastEmailResetDate?.toString().split("T")[0];

    let emailsSentToday = profile.dailyEmailSentCount || 0;
    if (lastResetDate !== today) {
      emailsSentToday = 0;
      await db.update(userProfiles)
        .set({ dailyEmailSentCount: 0, lastEmailResetDate: sql`CURRENT_DATE` })
        .where(eq(userProfiles.userId, req.userId!));
    }

    res.json({
      emailsSentToday,
      dailyLimit: DAILY_EMAIL_LIMIT,
      remaining: DAILY_EMAIL_LIMIT - emailsSentToday,
      subscriptionStatus: profile.subscriptionStatus,
    });
  } catch (error) {
    console.error("Get email stats error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/send", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { jobId } = req.body;

    const [profile] = await db.select().from(userProfiles).where(eq(userProfiles.userId, req.userId!));
    
    if (!profile) {
      return res.status(404).json({ error: "Profile not found. Please complete onboarding." });
    }

    if (!profile.gmailId || !profile.gmailAppPassword) {
      return res.status(400).json({ error: "Gmail credentials not configured. Please update your settings." });
    }

    if (!profile.resumeUrl) {
      return res.status(400).json({ error: "Resume not uploaded. Please upload your resume." });
    }

    const today = new Date().toISOString().split("T")[0];
    const lastResetDate = profile.lastEmailResetDate?.toString().split("T")[0];
    let emailsSentToday = profile.dailyEmailSentCount || 0;

    if (lastResetDate !== today) {
      emailsSentToday = 0;
      await db.update(userProfiles)
        .set({ dailyEmailSentCount: 0, lastEmailResetDate: sql`CURRENT_DATE` })
        .where(eq(userProfiles.userId, req.userId!));
    }

    if (emailsSentToday >= DAILY_EMAIL_LIMIT) {
      return res.status(429).json({ error: "Daily email limit reached. Please try again tomorrow." });
    }

    const [job] = await db
      .select({
        id: jobs.id,
        title: jobs.title,
        companyName: recruiters.companyName,
        recruiterName: recruiters.recruiterName,
        recruiterEmail: recruiters.recruiterEmail,
      })
      .from(jobs)
      .leftJoin(recruiters, eq(jobs.recruiterId, recruiters.id))
      .where(eq(jobs.id, jobId));

    if (!job || !job.recruiterEmail) {
      return res.status(404).json({ error: "Job or recruiter email not found" });
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: profile.gmailId,
        pass: profile.gmailAppPassword,
      },
    });

    const emailHtml = getEmailTemplate(
      profile.name || "Job Seeker",
      job.recruiterName || "Hiring Manager",
      job.companyName || "Your Company",
      job.title
    );

    try {
      await transporter.sendMail({
        from: profile.gmailId,
        to: job.recruiterEmail,
        subject: `Application for ${job.title} at ${job.companyName || "Your Company"}`,
        html: emailHtml,
        attachments: profile.resumeUrl
          ? [{ filename: "Resume.pdf", path: `.${profile.resumeUrl}` }]
          : [],
      });

      await db.insert(coldEmailLogs).values({
        userId: req.userId!,
        recruiterEmail: job.recruiterEmail,
        jobId: job.id,
        status: "sent",
      });

      await db.update(userProfiles)
        .set({ dailyEmailSentCount: emailsSentToday + 1 })
        .where(eq(userProfiles.userId, req.userId!));

      res.json({ 
        message: "Email sent successfully",
        emailsSentToday: emailsSentToday + 1,
        remaining: DAILY_EMAIL_LIMIT - emailsSentToday - 1,
      });
    } catch (emailError: any) {
      await db.insert(coldEmailLogs).values({
        userId: req.userId!,
        recruiterEmail: job.recruiterEmail,
        jobId: job.id,
        status: "failed",
        errorMessage: emailError.message,
      });

      res.status(500).json({ error: "Failed to send email. Check your Gmail credentials." });
    }
  } catch (error) {
    console.error("Send email error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/logs", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const logs = await db
      .select({
        id: coldEmailLogs.id,
        recruiterEmail: coldEmailLogs.recruiterEmail,
        status: coldEmailLogs.status,
        timestamp: coldEmailLogs.timestamp,
        jobTitle: jobs.title,
        companyName: recruiters.companyName,
      })
      .from(coldEmailLogs)
      .leftJoin(jobs, eq(coldEmailLogs.jobId, jobs.id))
      .leftJoin(recruiters, eq(jobs.recruiterId, recruiters.id))
      .where(eq(coldEmailLogs.userId, req.userId!))
      .orderBy(sql`${coldEmailLogs.timestamp} DESC`);

    res.json(logs);
  } catch (error) {
    console.error("Get email logs error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
