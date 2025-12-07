import mongoose, { Document, Schema } from "mongoose";

export type PlanTier = "pro" | "pro_plus" | "pro_max";

export interface PlanConfig {
  name: string;
  tier: PlanTier;
  price: number;
  dailyEmailLimit: number;
  features: string[];
}

export const PLAN_CONFIGS: Record<PlanTier, PlanConfig> = {
  pro: {
    name: "Pro Monthly",
    tier: "pro",
    price: 500,
    dailyEmailLimit: 20,
    features: [
      "Access to all job listings",
      "20 cold emails per day",
      "AI-powered job matching",
      "Custom email templates",
      "Priority job listings",
      "Resume builder",
      "Analytics dashboard",
    ],
  },
  pro_plus: {
    name: "Pro Plus",
    tier: "pro_plus",
    price: 1200,
    dailyEmailLimit: 200,
    features: [
      "All Pro features",
      "200 cold emails per day",
      "Advanced analytics",
      "Priority support",
      "Bulk email sending",
      "Email scheduling",
      "Recruiter insights",
    ],
  },
  pro_max: {
    name: "Pro Max",
    tier: "pro_max",
    price: 2000,
    dailyEmailLimit: 350,
    features: [
      "All Pro Plus features",
      "350 cold emails per day",
      "Dedicated account manager",
      "API access",
      "Custom integrations",
      "White-glove onboarding",
      "Unlimited templates",
    ],
  },
};

export interface ISubscription extends Document {
  userId: mongoose.Types.ObjectId;
  planName: string;
  planTier: PlanTier;
  dailyEmailLimit: number;
  amount: number;
  currency: string;
  status: "pending" | "active" | "expired" | "cancelled" | "failed";
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
  startDate: Date;
  endDate: Date;
  autoRenew: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const subscriptionSchema = new Schema<ISubscription>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  planName: {
    type: String,
    required: true,
    default: "Pro Monthly",
  },
  planTier: {
    type: String,
    enum: ["pro", "pro_plus", "pro_max"],
    default: "pro",
  },
  dailyEmailLimit: {
    type: Number,
    default: 20,
  },
  amount: {
    type: Number,
    required: true,
    default: 500,
  },
  currency: {
    type: String,
    default: "INR",
  },
  status: {
    type: String,
    enum: ["pending", "active", "expired", "cancelled", "failed"],
    default: "pending",
  },
  razorpayOrderId: {
    type: String,
    default: null,
  },
  razorpayPaymentId: {
    type: String,
    default: null,
  },
  razorpaySignature: {
    type: String,
    default: null,
  },
  startDate: {
    type: Date,
    default: null,
  },
  endDate: {
    type: Date,
    default: null,
  },
  autoRenew: {
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

subscriptionSchema.pre('save', function() {
  this.updatedAt = new Date();
});

subscriptionSchema.index({ userId: 1, status: 1 });
subscriptionSchema.index({ razorpayOrderId: 1 });

export default mongoose.model<ISubscription>("Subscription", subscriptionSchema);
