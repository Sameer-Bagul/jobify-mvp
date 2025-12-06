import { Response } from "express";
import nodemailer from "nodemailer";
import { UserProfile, ColdEmailLog, Job } from "../models/index.js";
import { AuthRequest } from "../middleware/auth.js";
import path from "path";
import fs from "fs";

const DAILY_EMAIL_LIMIT = 20;

export const getEmailStats = async (req: AuthRequest, res: Response) => {
  try {
    const profile = await UserProfile.findOne({ userId: req.userId });
    if (!profile) {
      return res.status(404).json({ error: "Profile not found" });
    }

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

    const totalSent = await ColdEmailLog.countDocuments({ userId: req.userId });

    res.json({
      dailySent: profile.dailyEmailSentCount,
      dailyLimit: DAILY_EMAIL_LIMIT,
      remaining: DAILY_EMAIL_LIMIT - profile.dailyEmailSentCount,
      totalSent,
      hasGmailSetup: !!(profile.gmailId && profile.gmailAppPassword),
    });
  } catch (error) {
    console.error("Get email stats error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const sendEmail = async (req: AuthRequest, res: Response) => {
  try {
    const { recruiterEmail, subject, body, jobId } = req.body;

    if (!recruiterEmail || !subject || !body) {
      return res.status(400).json({
        error: "Recruiter email, subject, and body are required",
      });
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

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (
      !profile.lastEmailResetDate ||
      new Date(profile.lastEmailResetDate) < today
    ) {
      profile.dailyEmailSentCount = 0;
      profile.lastEmailResetDate = today;
    }

    if (profile.dailyEmailSentCount >= DAILY_EMAIL_LIMIT) {
      return res.status(429).json({
        error: "Daily email limit reached. Try again tomorrow.",
      });
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: profile.gmailId,
        pass: profile.gmailAppPassword,
      },
    });

    const mailOptions: nodemailer.SendMailOptions = {
      from: profile.gmailId,
      to: recruiterEmail,
      subject,
      text: body,
    };

    if (profile.resumeUrl) {
      const resumePath = path.join(process.cwd(), profile.resumeUrl);
      if (fs.existsSync(resumePath)) {
        mailOptions.attachments = [
          {
            filename: path.basename(profile.resumeUrl),
            path: resumePath,
          },
        ];
      }
    }

    try {
      await transporter.sendMail(mailOptions);

      profile.dailyEmailSentCount += 1;
      await profile.save();

      await ColdEmailLog.create({
        userId: req.userId,
        recruiterEmail,
        jobId: jobId || null,
        status: "sent",
      });

      res.json({
        message: "Email sent successfully",
        remaining: DAILY_EMAIL_LIMIT - profile.dailyEmailSentCount,
      });
    } catch (emailError: any) {
      await ColdEmailLog.create({
        userId: req.userId,
        recruiterEmail,
        jobId: jobId || null,
        status: "failed",
        errorMessage: emailError.message,
      });

      return res.status(500).json({
        error: "Failed to send email. Please check your Gmail credentials.",
      });
    }
  } catch (error) {
    console.error("Send email error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getEmailLogs = async (req: AuthRequest, res: Response) => {
  try {
    const logs = await ColdEmailLog.find({ userId: req.userId })
      .populate({
        path: "jobId",
        select: "title",
      })
      .sort({ timestamp: -1 })
      .limit(50);

    res.json({ logs });
  } catch (error) {
    console.error("Get email logs error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
