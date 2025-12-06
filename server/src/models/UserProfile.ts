import mongoose, { Document, Schema } from "mongoose";

export interface IUserProfile extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  skills: string[];
  experience: string;
  gmailId: string;
  gmailAppPassword: string;
  resumeUrl: string;
  dailyEmailSentCount: number;
  lastEmailResetDate: Date;
  subscriptionStatus: string;
  subscriptionExpiry: Date;
  createdAt: Date;
}

const userProfileSchema = new Schema<IUserProfile>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
  name: {
    type: String,
    default: null,
  },
  skills: {
    type: [String],
    default: [],
  },
  experience: {
    type: String,
    default: null,
  },
  gmailId: {
    type: String,
    default: null,
  },
  gmailAppPassword: {
    type: String,
    default: null,
  },
  resumeUrl: {
    type: String,
    default: null,
  },
  dailyEmailSentCount: {
    type: Number,
    default: 0,
  },
  lastEmailResetDate: {
    type: Date,
    default: null,
  },
  subscriptionStatus: {
    type: String,
    default: "inactive",
  },
  subscriptionExpiry: {
    type: Date,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model<IUserProfile>("UserProfile", userProfileSchema);
