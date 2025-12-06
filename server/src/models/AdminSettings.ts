import mongoose, { Document, Schema } from "mongoose";

export interface IAdminSettings extends Document {
  key: string;
  value: string | number | boolean;
  description: string;
  updatedBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const adminSettingsSchema = new Schema<IAdminSettings>({
  key: {
    type: String,
    required: true,
    unique: true,
  },
  value: {
    type: Schema.Types.Mixed,
    required: true,
  },
  description: {
    type: String,
    default: null,
  },
  updatedBy: {
    type: Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

adminSettingsSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export const DEFAULT_SETTINGS = {
  DAILY_EMAIL_LIMIT: { key: "daily_email_limit", value: 20, description: "Maximum emails per user per day" },
  SYSTEM_AVAILABLE: { key: "system_available", value: true, description: "System availability toggle" },
  SUBSCRIPTION_PRICE: { key: "subscription_price", value: 500, description: "Monthly subscription price in INR" },
  FREE_TRIAL_DAYS: { key: "free_trial_days", value: 7, description: "Number of free trial days" },
  MAX_RESUME_SIZE_MB: { key: "max_resume_size_mb", value: 5, description: "Maximum resume file size in MB" },
};

export default mongoose.model<IAdminSettings>("AdminSettings", adminSettingsSchema);
