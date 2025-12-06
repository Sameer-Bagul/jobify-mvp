import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import cron from "node-cron";
import { fileURLToPath } from "url";
import connectDB from "./config/database.js";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import jobRoutes from "./routes/jobs.js";
import emailRoutes from "./routes/email.js";
import recruiterRoutes from "./routes/recruiters.js";
import subscriptionRoutes from "./routes/subscription.js";
import adminRoutes from "./routes/admin.js";
import { UserProfile } from "./models/index.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: true,
  credentials: true,
}));
app.use(express.json());
app.use("/uploads", express.static("uploads"));

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/email", emailRoutes);
app.use("/api/recruiters", recruiterRoutes);
app.use("/api/subscription", subscriptionRoutes);
app.use("/api/admin", adminRoutes);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

cron.schedule("0 0 * * *", async () => {
  console.log("Running daily email quota reset...");
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    await UserProfile.updateMany(
      { lastEmailResetDate: { $lt: today } },
      { 
        $set: { 
          dailyEmailSentCount: 0,
          lastEmailResetDate: today,
        }
      }
    );
    console.log("Daily email quota reset completed.");
  } catch (error) {
    console.error("Error resetting daily email quota:", error);
  }
});

if (process.env.NODE_ENV === "production") {
  const clientDist = path.join(__dirname, "../../client/dist");
  app.use(express.static(clientDist));
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api")) {
      return res.status(404).json({ error: "API endpoint not found" });
    }
    res.sendFile(path.join(clientDist, "index.html"));
  });
}

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
