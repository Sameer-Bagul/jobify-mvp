import mongoose, { Document, Schema } from "mongoose";

export interface IRecruiter extends Document {
  userId: mongoose.Types.ObjectId | null;
  companyName: string;
  recruiterName: string;
  recruiterEmail: string;
  phone: string;
  linkedinUrl: string;
  industry: string;
  location: string;
  isInternal: boolean;
  addedBy: mongoose.Types.ObjectId | null;
  notes: string;
  onboardingCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const recruiterSchema = new Schema<IRecruiter>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
  companyName: {
    type: String,
    default: null,
  },
  recruiterName: {
    type: String,
    default: null,
  },
  recruiterEmail: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    default: null,
  },
  linkedinUrl: {
    type: String,
    default: null,
  },
  industry: {
    type: String,
    default: null,
  },
  location: {
    type: String,
    default: null,
  },
  isInternal: {
    type: Boolean,
    default: false,
  },
  addedBy: {
    type: Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
  notes: {
    type: String,
    default: null,
  },
  onboardingCompleted: {
    type: Boolean,
    default: false,
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

recruiterSchema.pre('save', function() {
  this.updatedAt = new Date();
});

recruiterSchema.index({ recruiterEmail: 1 });
recruiterSchema.index({ companyName: 1 });
recruiterSchema.index({ isInternal: 1 });

export default mongoose.model<IRecruiter>("Recruiter", recruiterSchema);
