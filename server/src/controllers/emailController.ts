import { Response } from "express";
import { UserProfile, ColdEmailLog, EmailTemplate, Subscription, ActivityLog, Recruiter } from "../models/index.js";
import { AuthRequest } from "../middleware/auth.js";
import { sendEmail, fillTemplate } from "../utils/emailService.js";
import path from "path";
import { PLAN_CONFIGS, PlanTier, ISubscription } from "../models/Subscription.js";

const DEFAULT_DAILY_LIMIT = 20;

const getDailyLimitForSubscription = (subscription: ISubscription | null): number => {
  if (!subscription) return 0;
  if (subscription.dailyEmailLimit) return subscription.dailyEmailLimit;
  const planConfig = PLAN_CONFIGS[subscription.planTier as PlanTier];
  return planConfig?.dailyEmailLimit || DEFAULT_DAILY_LIMIT;
};

export const getEmailStats = async (req: AuthRequest, res: Response) => {
  try {
    const profile = await UserProfile.findOne({ userId: req.userId });
    if (!profile) {
      return res.status(404).json({ error: "Profile not found" });
    }

    const subscription = await Subscription.findOne({
      userId: req.userId,
      status: "active",
      endDate: { $gte: new Date() },
    });

    const dailyLimit = getDailyLimitForSubscription(subscription);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (
      !profile.lastEmailResetDate ||
      new Date(profile.lastEmailResetDate) < today
    ) {
      profile.dailyEmailSentCount = 0;
      profile.lastEmailResetDate = today;
      await profile.save();
    }

    const totalSent = await ColdEmailLog.countDocuments({ userId: req.userId, status: "sent" });
    const totalFailed = await ColdEmailLog.countDocuments({ userId: req.userId, status: "failed" });

    res.json({
      dailySent: profile.dailyEmailSentCount,
      dailyLimit,
      remaining: Math.max(0, dailyLimit - profile.dailyEmailSentCount),
      totalSent,
      totalFailed,
      hasGmailSetup: !!(profile.gmailId && profile.gmailAppPassword),
      hasResume: !!profile.resumeUrl,
      isSubscribed: !!subscription,
      planName: subscription?.planName || null,
      planTier: subscription?.planTier || null,
    });
  } catch (error) {
    console.error("Get email stats error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const sendColdEmail = async (req: AuthRequest, res: Response) => {
  try {
    const { recruiterEmail, recruiterName, companyName, jobId, jobTitle, subject, body, templateId } = req.body;

    if (!recruiterEmail) {
      return res.status(400).json({ error: "Recruiter email is required" });
    }

    const profile = await UserProfile.findOne({ userId: req.userId });
    if (!profile) {
      return res.status(404).json({ error: "Profile not found" });
    }

    if (!profile.gmailId || !profile.gmailAppPassword) {
      return res.status(400).json({
        error: "Gmail credentials not configured. Please complete onboarding.",
      });
    }

    const subscription = await Subscription.findOne({
      userId: req.userId,
      status: "active",
      endDate: { $gte: new Date() },
    });

    if (!subscription) {
      return res.status(403).json({
        error: "Subscription required to send cold emails",
        requiresSubscription: true,
      });
    }

    const dailyLimit = getDailyLimitForSubscription(subscription);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (
      !profile.lastEmailResetDate ||
      new Date(profile.lastEmailResetDate) < today
    ) {
      profile.dailyEmailSentCount = 0;
      profile.lastEmailResetDate = today;
    }

    if (profile.dailyEmailSentCount >= dailyLimit) {
      return res.status(429).json({
        error: `Daily email limit (${dailyLimit}) reached. Try again tomorrow or upgrade your plan.`,
      });
    }

    let emailSubject = subject;
    let emailBody = body;

    if (templateId) {
      const template = await EmailTemplate.findById(templateId);
      if (template) {
        const placeholders = {
          recruiter_name: recruiterName || "Hiring Manager",
          job_role: jobTitle || "the open position",
          company_name: companyName || "your company",
          skills: profile.skills?.join(", ") || "",
          experience_summary: profile.experience || "",
          user_name: profile.name || "",
        };
        emailSubject = fillTemplate(template.subject, placeholders);
        emailBody = fillTemplate(template.body, placeholders);
      }
    }

    const resumePath = profile.resumeUrl ? path.join(process.cwd(), profile.resumeUrl) : undefined;

    const result = await sendEmail({
      to: recruiterEmail,
      subject: emailSubject || "Job Application",
      body: emailBody || "Please find my application attached.",
      gmailId: profile.gmailId,
      gmailAppPassword: profile.gmailAppPassword,
      attachResume: !!profile.resumeUrl,
      resumePath,
    });

    const emailLog = await ColdEmailLog.create({
      userId: req.userId,
      recruiterEmail,
      recruiterName,
      companyName,
      jobId: jobId || undefined,
      jobTitle,
      templateId: templateId || undefined,
      subject: emailSubject,
      body: emailBody,
      status: result.success ? "sent" : "failed",
      errorMessage: result.error || undefined,
      resumeAttached: !!profile.resumeUrl,
    });

    if (result.success) {
      profile.dailyEmailSentCount += 1;
      await profile.save();

      await ActivityLog.create({
        userId: req.userId,
        action: `Sent email to ${recruiterName || recruiterEmail}`,
        actionType: "email_sent",
        details: { recruiterEmail, companyName, jobTitle },
      });

      res.json({
        message: "Email sent successfully",
        remaining: dailyLimit - profile.dailyEmailSentCount,
        emailLog,
      });
    } else {
      res.status(500).json({
        error: result.error || "Failed to send email. Please check your Gmail credentials.",
        emailLog,
      });
    }
  } catch (error) {
    console.error("Send email error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const sendBulkEmails = async (req: AuthRequest, res: Response) => {
  try {
    const { recipients, subject, body, templateId } = req.body;

    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return res.status(400).json({ error: "Recipients array is required" });
    }

    const profile = await UserProfile.findOne({ userId: req.userId });
    if (!profile || !profile.gmailId || !profile.gmailAppPassword) {
      return res.status(400).json({ error: "Gmail credentials not configured" });
    }

    const subscription = await Subscription.findOne({
      userId: req.userId,
      status: "active",
      endDate: { $gte: new Date() },
    });

    if (!subscription) {
      return res.status(403).json({ error: "Subscription required", requiresSubscription: true });
    }

    const dailyLimit = getDailyLimitForSubscription(subscription);
    const remaining = dailyLimit - profile.dailyEmailSentCount;

    if (remaining <= 0) {
      return res.status(429).json({ error: `Daily email limit (${dailyLimit}) reached. Upgrade your plan for more.` });
    }

    const toSend = recipients.slice(0, remaining);
    const results = { sent: 0, failed: 0, errors: [] as string[] };

    for (const recipient of toSend) {
      let emailSubject = subject;
      let emailBody = body;

      const placeholders = {
        recruiter_name: recipient.recruiterName || "Hiring Manager",
        job_role: recipient.jobTitle || "the open position",
        company_name: recipient.companyName || "your company",
        skills: profile.skills?.join(", ") || "",
        experience_summary: profile.experience || "",
        user_name: profile.name || "",
      };

      if (templateId) {
        const template = await EmailTemplate.findById(templateId);
        if (template) {
          emailSubject = fillTemplate(template.subject, placeholders);
          emailBody = fillTemplate(template.body, placeholders);
        }
      } else {
        emailSubject = fillTemplate(emailSubject || "", placeholders);
        emailBody = fillTemplate(emailBody || "", placeholders);
      }

      const resumePath = profile.resumeUrl ? path.join(process.cwd(), profile.resumeUrl) : undefined;

      const result = await sendEmail({
        to: recipient.email,
        subject: emailSubject,
        body: emailBody,
        gmailId: profile.gmailId,
        gmailAppPassword: profile.gmailAppPassword,
        attachResume: !!profile.resumeUrl,
        resumePath,
      });

      await ColdEmailLog.create({
        userId: req.userId,
        recruiterEmail: recipient.email,
        recruiterName: recipient.recruiterName,
        companyName: recipient.companyName,
        jobTitle: recipient.jobTitle,
        subject: emailSubject,
        body: emailBody,
        status: result.success ? "sent" : "failed",
        errorMessage: result.error,
        resumeAttached: !!profile.resumeUrl,
      });

      if (result.success) {
        results.sent++;
        profile.dailyEmailSentCount++;
      } else {
        results.failed++;
        results.errors.push(`${recipient.email}: ${result.error}`);
      }
    }

    await profile.save();

    res.json({
      message: `Sent ${results.sent} emails, ${results.failed} failed`,
      results,
      remaining: dailyLimit - profile.dailyEmailSentCount,
      skipped: recipients.length - toSend.length,
    });
  } catch (error) {
    console.error("Send bulk emails error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getEmailLogs = async (req: AuthRequest, res: Response) => {
  try {
    const { page = 1, limit = 50, status, startDate, endDate } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const query: any = { userId: req.userId };
    if (status) query.status = status;
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate as string);
      if (endDate) query.timestamp.$lte = new Date(endDate as string);
    }

    const logs = await ColdEmailLog.find(query)
      .populate("jobId", "title company")
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(Number(limit));

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
    console.error("Get email logs error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getEmailTemplates = async (req: AuthRequest, res: Response) => {
  try {
    const templates = await EmailTemplate.find({ userId: req.userId }).sort({ isDefault: -1, createdAt: -1 });
    res.json({ templates });
  } catch (error) {
    console.error("Get email templates error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const createEmailTemplate = async (req: AuthRequest, res: Response) => {
  try {
    const { name, subject, body, isDefault } = req.body;

    if (!name || !subject || !body) {
      return res.status(400).json({ error: "Name, subject, and body are required" });
    }

    if (isDefault) {
      await EmailTemplate.updateMany({ userId: req.userId }, { isDefault: false });
    }

    const template = await EmailTemplate.create({
      userId: req.userId,
      name,
      subject,
      body,
      isDefault: isDefault || false,
    });

    res.status(201).json({
      message: "Template created successfully",
      template,
    });
  } catch (error) {
    console.error("Create email template error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const updateEmailTemplate = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, subject, body, isDefault } = req.body;

    const template = await EmailTemplate.findOne({ _id: id, userId: req.userId });
    if (!template) {
      return res.status(404).json({ error: "Template not found" });
    }

    if (isDefault) {
      await EmailTemplate.updateMany({ userId: req.userId, _id: { $ne: id } }, { isDefault: false });
    }

    if (name !== undefined) template.name = name;
    if (subject !== undefined) template.subject = subject;
    if (body !== undefined) template.body = body;
    if (isDefault !== undefined) template.isDefault = isDefault;

    await template.save();

    res.json({
      message: "Template updated successfully",
      template,
    });
  } catch (error) {
    console.error("Update email template error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const deleteEmailTemplate = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const template = await EmailTemplate.findOneAndDelete({ _id: id, userId: req.userId });
    if (!template) {
      return res.status(404).json({ error: "Template not found" });
    }

    res.json({ message: "Template deleted successfully" });
  } catch (error) {
    console.error("Delete email template error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getAvailableRecruiters = async (req: AuthRequest, res: Response) => {
  try {
    const { search, company, industry } = req.query;

    const query: any = { isInternal: true };
    if (search) {
      query.$or = [
        { recruiterName: { $regex: search, $options: "i" } },
        { recruiterEmail: { $regex: search, $options: "i" } },
        { companyName: { $regex: search, $options: "i" } },
      ];
    }
    if (company) query.companyName = { $regex: company, $options: "i" };
    if (industry) query.industry = { $regex: industry, $options: "i" };

    const recruiters = await Recruiter.find(query).limit(100);

    res.json({ recruiters });
  } catch (error) {
    console.error("Get available recruiters error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
