import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { db } from "../db.js";
import { users, userProfiles, recruiters } from "../../shared/schema.js";
import { eq } from "drizzle-orm";

const router = Router();

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.warn("WARNING: JWT_SECRET not set. Using development fallback.");
}
const getJwtSecret = () => JWT_SECRET || "dev-secret-not-for-production";

router.post("/signup", async (req, res) => {
  try {
    const { email, password, role = "seeker", name, companyName } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const existingUser = await db.select().from(users).where(eq(users.email, email));
    if (existingUser.length > 0) {
      return res.status(400).json({ error: "User already exists" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const [newUser] = await db.insert(users).values({
      email,
      passwordHash,
      role,
    }).returning();

    if (role === "seeker") {
      await db.insert(userProfiles).values({
        userId: newUser.id,
        name: name || null,
      });
    } else if (role === "recruiter") {
      await db.insert(recruiters).values({
        userId: newUser.id,
        recruiterName: name || null,
        companyName: companyName || null,
        recruiterEmail: email,
      });
    }

    const token = jwt.sign({ userId: newUser.id, role: newUser.role }, getJwtSecret(), { expiresIn: "7d" });

    res.status(201).json({
      message: "User created successfully",
      token,
      user: { id: newUser.id, email: newUser.email, role: newUser.role },
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const [user] = await db.select().from(users).where(eq(users.email, email));
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign({ userId: user.id, role: user.role }, getJwtSecret(), { expiresIn: "7d" });

    res.json({
      message: "Login successful",
      token,
      user: { id: user.id, email: user.email, role: user.role },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
