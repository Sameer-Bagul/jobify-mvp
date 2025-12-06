import mongoose, { Document, Schema } from "mongoose";

export interface IColdEmailLog extends Document {
  userId: mongoose.Types.ObjectId;
  recruiterEmail: string;
  recruiterName: string;
  companyName: string;
  jobId: mongoose.Types.ObjectId | null;
  jobTitle: string;
  templateId: mongoose.Types.ObjectId | null;
  subject: string;
  body: string;
  status: "sent" | "failed" | "pending" | "queued";
  errorMessage: string;
  resumeAttached: boolean;
  openedAt: Date | null;
  repliedAt: Date | null;
  timestamp: Date;
}

const coldEmailLogSchema = new Schema<IColdEmailLog>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  recruiterEmail: {
    type: String,
    required: true,
  },
  recruiterName: {
    type: String,
    default: null,
  },
  companyName: {
    type: String,
    default: null,
  },
  jobId: {
    type: Schema.Types.ObjectId,
    ref: "Job",
    default: null,
  },
  jobTitle: {
    type: String,
    default: null,
  },
  templateId: {
    type: Schema.Types.ObjectId,
    ref: "EmailTemplate",
    default: null,
  },
  subject: {
    type: String,
    default: null,
  },
  body: {
    type: String,
    default: null,
  },
  status: {
    type: String,
    enum: ["sent", "failed", "pending", "queued"],
    default: "pending",
  },
  errorMessage: {
    type: String,
    default: null,
  },
  resumeAttached: {
    type: Boolean,
    default: true,
  },
  openedAt: {
    type: Date,
    default: null,
  },
  repliedAt: {
    type: Date,
    default: null,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

coldEmailLogSchema.index({ userId: 1, timestamp: -1 });
coldEmailLogSchema.index({ status: 1 });
coldEmailLogSchema.index({ recruiterEmail: 1 });

export default mongoose.model<IColdEmailLog>("ColdEmailLog", coldEmailLogSchema);
