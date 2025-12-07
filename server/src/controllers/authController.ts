import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User, UserProfile, Recruiter, ActivityLog } from "../models/index.js";
import { generateOTP } from "../utils/encryption.js";
import { sendOTPEmail } from "../utils/emailService.js";
import { env } from "../config/env.js";

export const signup = async (req: Request, res: Response) => {
  try {
    const { email, password, role = "seeker", name, companyName } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      email: email.toLowerCase(),
      passwordHash,
      role,
    });

    if (role === "seeker") {
      await UserProfile.create({
        userId: newUser._id,
        name: name || null,
      });
    } else if (role === "recruiter") {
      await Recruiter.create({
        userId: newUser._id,
        recruiterName: name || "Unnamed Recruiter",
        companyName: companyName || "Company",
        recruiterEmail: email.toLowerCase(),
        isInternal: false,
      });
    }

    const token = jwt.sign(
      { userId: newUser._id, role: newUser.role },
      env.jwtSecret,
      { expiresIn: "7d" }
    );

    await ActivityLog.create({
      userId: newUser._id,
      action: "User signed up",
      actionType: "login",
      details: { role },
    });

    res.status(201).json({
      message: "User created successfully",
      token,
      user: { id: newUser._id, email: newUser.email, role: newUser.role, onboardingCompleted: false },
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    if (user.isBanned) {
      return res.status(403).json({ error: "Your account has been suspended. Please contact support." });
    }

    if (!user.isActive) {
      return res.status(403).json({ error: "Your account is inactive." });
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    user.lastLogin = new Date();
    await user.save();

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      env.jwtSecret,
      { expiresIn: "7d" }
    );

    await ActivityLog.create({
      userId: user._id,
      action: "User logged in",
      actionType: "login",
      details: {},
    });

    // Check onboarding status based on role
    let onboardingCompleted = true;
    if (user.role === "seeker") {
      const profile = await UserProfile.findOne({ userId: user._id });
      onboardingCompleted = profile?.onboardingCompleted ?? false;
    } else if (user.role === "recruiter") {
      const recruiter = await Recruiter.findOne({ userId: user._id });
      onboardingCompleted = recruiter?.onboardingCompleted ?? false;
    }

    res.json({
      message: "Login successful",
      token,
      user: { id: user._id, email: user.email, role: user.role, onboardingCompleted },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.json({ message: "If the email exists, an OTP will be sent." });
    }

    const otp = generateOTP();
    const expiry = new Date(Date.now() + 10 * 60 * 1000);

    user.resetPasswordOTP = otp;
    user.resetPasswordExpiry = expiry;
    await user.save();

    const emailResult = await sendOTPEmail(email, otp);
    
    if (!emailResult.success) {
      console.error("Failed to send OTP email:", emailResult.error);
    }

    res.json({ message: "If the email exists, an OTP will be sent." });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const verifyOTP = async (req: Request, res: Response) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ error: "Email and OTP are required" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(400).json({ error: "Invalid OTP" });
    }

    if (!user.resetPasswordOTP || !user.resetPasswordExpiry) {
      return res.status(400).json({ error: "No OTP request found. Please request a new one." });
    }

    if (new Date() > user.resetPasswordExpiry) {
      user.resetPasswordOTP = null;
      user.resetPasswordExpiry = null;
      await user.save();
      return res.status(400).json({ error: "OTP has expired. Please request a new one." });
    }

    if (user.resetPasswordOTP !== otp) {
      return res.status(400).json({ error: "Invalid OTP" });
    }

    res.json({ message: "OTP verified successfully", verified: true });
  } catch (error) {
    console.error("Verify OTP error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ error: "Email, OTP, and new password are required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(400).json({ error: "Invalid request" });
    }

    if (!user.resetPasswordOTP || user.resetPasswordOTP !== otp) {
      return res.status(400).json({ error: "Invalid OTP" });
    }

    if (user.resetPasswordExpiry && new Date() > user.resetPasswordExpiry) {
      return res.status(400).json({ error: "OTP has expired" });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    user.passwordHash = passwordHash;
    user.resetPasswordOTP = null;
    user.resetPasswordExpiry = null;
    await user.save();

    res.json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const changePassword = async (req: Request, res: Response) => {
  try {
    const { userId, currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: "Current and new password are required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const isValidPassword = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isValidPassword) {
      return res.status(400).json({ error: "Current password is incorrect" });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    user.passwordHash = passwordHash;
    await user.save();

    res.json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
