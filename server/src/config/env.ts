import dotenv from "dotenv";

dotenv.config();

interface EnvironmentConfig {
  required: string[];
  optional: string[];
}

const envConfig: EnvironmentConfig = {
  required: [
    "MONGODB_URI",
    "JWT_SECRET",
    "ENCRYPTION_KEY",
  ],
  optional: [
    "PORT",
    "NODE_ENV",
    "SYSTEM_GMAIL_ID",
    "SYSTEM_GMAIL_PASSWORD",
    "RAZORPAY_KEY_ID",
    "RAZORPAY_KEY_SECRET",
    "FRONTEND_URL",
  ],
};

export function validateEnvironment(): void {
  const missing: string[] = [];
  const warnings: string[] = [];

  // Check required variables
  envConfig.required.forEach((varName) => {
    if (!process.env[varName]) {
      missing.push(varName);
    }
  });

  if (missing.length > 0) {
    console.error("❌ Missing required environment variables:");
    missing.forEach((varName) => {
      console.error(`   - ${varName}`);
    });
    console.error("\nPlease check your .env file. See .env.example for reference.");
    process.exit(1);
  }

  // Check encryption key length
  const encryptionKey = process.env.ENCRYPTION_KEY || "";
  if (encryptionKey.length < 32) {
    console.warn("⚠️  ENCRYPTION_KEY should be at least 32 characters for AES-256");
    warnings.push("ENCRYPTION_KEY");
  }

  // Check optional but important variables
  if (!process.env.SYSTEM_GMAIL_ID || !process.env.SYSTEM_GMAIL_PASSWORD) {
    console.warn("⚠️  Email service not configured (SYSTEM_GMAIL_ID, SYSTEM_GMAIL_PASSWORD)");
    console.warn("   - Password reset OTP emails will not work");
    warnings.push("EMAIL_SERVICE");
  }

  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    console.warn("⚠️  Razorpay not configured (RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET)");
    console.warn("   - Payment/subscription features will not work");
    warnings.push("RAZORPAY");
  }

  // JWT Secret strength check
  const jwtSecret = process.env.JWT_SECRET || "";
  if (jwtSecret.length < 32) {
    console.warn("⚠️  JWT_SECRET should be at least 32 characters for better security");
    warnings.push("JWT_SECRET");
  }

  // Production checks
  if (process.env.NODE_ENV === "production") {
    if (jwtSecret.includes("dev") || jwtSecret.includes("test")) {
      console.error("❌ JWT_SECRET appears to be a development key in production!");
      process.exit(1);
    }
    if (encryptionKey.includes("default") || encryptionKey.includes("test")) {
      console.error("❌ ENCRYPTION_KEY appears to be a default key in production!");
      process.exit(1);
    }
  }

  if (warnings.length === 0) {
    console.log("✅ Environment configuration validated successfully");
  } else {
    console.log("\n⚠️  Some optional features may be limited due to missing configuration");
  }
}

export const env = {
  port: parseInt(process.env.PORT || "3000", 10),
  nodeEnv: process.env.NODE_ENV || "development",
  mongoUri: process.env.MONGODB_URI || "",
  jwtSecret: process.env.JWT_SECRET || "",
  encryptionKey: process.env.ENCRYPTION_KEY || "",
  systemEmail: {
    id: process.env.SYSTEM_GMAIL_ID,
    password: process.env.SYSTEM_GMAIL_PASSWORD,
  },
  razorpay: {
    keyId: process.env.RAZORPAY_KEY_ID,
    keySecret: process.env.RAZORPAY_KEY_SECRET,
  },
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:5001",
  isProduction: process.env.NODE_ENV === "production",
  isDevelopment: process.env.NODE_ENV === "development",
};
