import mongoose, { Document, Schema } from "mongoose";

export interface IActivityLog extends Document {
  userId: mongoose.Types.ObjectId;
  action: string;
  actionType: "email_sent" | "job_viewed" | "job_saved" | "recruiter_saved" | "profile_updated" | "subscription_changed" | "login" | "other";
  details: Record<string, any>;
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
}

const activityLogSchema = new Schema<IActivityLog>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  action: {
    type: String,
    required: true,
  },
  actionType: {
    type: String,
    enum: ["email_sent", "job_viewed", "job_saved", "recruiter_saved", "profile_updated", "subscription_changed", "login", "other"],
    default: "other",
  },
  details: {
    type: Schema.Types.Mixed,
    default: {},
  },
  ipAddress: {
    type: String,
    default: null,
  },
  userAgent: {
    type: String,
    default: null,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

activityLogSchema.index({ userId: 1, timestamp: -1 });
activityLogSchema.index({ actionType: 1 });

export default mongoose.model<IActivityLog>("ActivityLog", activityLogSchema);
