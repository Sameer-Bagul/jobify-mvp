import mongoose, { Document, Schema } from "mongoose";

export interface IJob extends Document {
  recruiterId: mongoose.Types.ObjectId;
  recruiterUserId: mongoose.Types.ObjectId;
  title: string;
  company: string;
  description: string;
  requiredSkills: string[];
  location: string;
  jobType: "full-time" | "part-time" | "contract" | "internship" | "remote";
  experienceLevel: "entry" | "mid" | "senior" | "lead";
  salaryMin: number;
  salaryMax: number;
  salaryCurrency: string;
  applicationDeadline: Date;
  isActive: boolean;
  viewCount: number;
  applicationCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const jobSchema = new Schema<IJob>({
  recruiterId: {
    type: Schema.Types.ObjectId,
    ref: "Recruiter",
    default: null,
  },
  recruiterUserId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
  title: {
    type: String,
    required: true,
  },
  company: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: null,
  },
  requiredSkills: {
    type: [String],
    default: [],
  },
  location: {
    type: String,
    default: null,
  },
  jobType: {
    type: String,
    enum: ["full-time", "part-time", "contract", "internship", "remote"],
    default: "full-time",
  },
  experienceLevel: {
    type: String,
    enum: ["entry", "mid", "senior", "lead"],
    default: "mid",
  },
  salaryMin: {
    type: Number,
    default: 0,
  },
  salaryMax: {
    type: Number,
    default: 0,
  },
  salaryCurrency: {
    type: String,
    default: "INR",
  },
  applicationDeadline: {
    type: Date,
    default: null,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  viewCount: {
    type: Number,
    default: 0,
  },
  applicationCount: {
    type: Number,
    default: 0,
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

jobSchema.pre('save', function() {
  this.updatedAt = new Date();
});

jobSchema.index({ requiredSkills: 1 });
jobSchema.index({ location: 1 });
jobSchema.index({ company: 1 });
jobSchema.index({ isActive: 1, createdAt: -1 });

export default mongoose.model<IJob>("Job", jobSchema);
