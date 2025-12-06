import nodemailer from "nodemailer";
import { decrypt } from "./encryption.js";
import path from "path";
import fs from "fs";

interface EmailOptions {
  to: string;
  subject: string;
  body: string;
  gmailId: string;
  gmailAppPassword: string;
  attachResume?: boolean;
  resumePath?: string;
  html?: boolean;
}

interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export async function sendEmail(options: EmailOptions): Promise<EmailResult> {
  try {
    const decryptedPassword = decrypt(options.gmailAppPassword);
    
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: options.gmailId,
        pass: decryptedPassword,
      },
    });

    const mailOptions: nodemailer.SendMailOptions = {
      from: options.gmailId,
      to: options.to,
      subject: options.subject,
      [options.html ? "html" : "text"]: options.body,
    };

    if (options.attachResume && options.resumePath) {
      const absolutePath = path.resolve(options.resumePath);
      if (fs.existsSync(absolutePath)) {
        mailOptions.attachments = [
          {
            filename: path.basename(absolutePath),
            path: absolutePath,
          },
        ];
      }
    }

    const info = await transporter.sendMail(mailOptions);
    
    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error: any) {
    console.error("Email sending error:", error);
    return {
      success: false,
      error: error.message || "Failed to send email",
    };
  }
}

export function fillTemplate(
  template: string,
  placeholders: Record<string, string>
): string {
  let filled = template;
  
  Object.entries(placeholders).forEach(([key, value]) => {
    const regex = new RegExp(`\\{\\{${key}\\}\\}`, "g");
    filled = filled.replace(regex, value || "");
  });
  
  return filled;
}

import { env } from "../config/env.js";

export async function sendOTPEmail(
  email: string,
  otp: string
): Promise<EmailResult> {
  if (!env.systemEmail.id || !env.systemEmail.password) {
    return {
      success: false,
      error: "System email not configured",
    };
  }

  const systemGmail = env.systemEmail.id;
  const systemPassword = env.systemEmail.password;

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: systemGmail,
        pass: systemPassword,
      },
    });

    const mailOptions = {
      from: systemGmail,
      to: email,
      subject: "Jobify - Password Reset OTP",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #6366f1;">Jobify Password Reset</h2>
          <p>You requested to reset your password. Use the OTP below:</p>
          <div style="background: #f3f4f6; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 4px; color: #6366f1;">${otp}</span>
          </div>
          <p style="color: #6b7280;">This OTP will expire in 10 minutes.</p>
          <p style="color: #6b7280;">If you didn't request this, please ignore this email.</p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    
    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error: any) {
    console.error("OTP email error:", error);
    return {
      success: false,
      error: error.message || "Failed to send OTP",
    };
  }
}
