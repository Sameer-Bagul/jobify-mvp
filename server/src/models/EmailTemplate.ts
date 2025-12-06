import mongoose, { Document, Schema } from "mongoose";

export interface IEmailTemplate extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  subject: string;
  body: string;
  isDefault: boolean;
  placeholders: string[];
  createdAt: Date;
  updatedAt: Date;
}

const emailTemplateSchema = new Schema<IEmailTemplate>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  subject: {
    type: String,
    required: true,
    default: "Application for {{job_role}} position at {{company_name}}",
  },
  body: {
    type: String,
    required: true,
    default: `Dear {{recruiter_name}},

I hope this email finds you well. I am writing to express my interest in the {{job_role}} position at {{company_name}}.

With my background in {{skills}}, I believe I would be a valuable addition to your team. My experience includes {{experience_summary}}.

I have attached my resume for your review. I would welcome the opportunity to discuss how my skills align with your team's needs.

Thank you for considering my application. I look forward to hearing from you.

Best regards,
{{user_name}}`,
  },
  isDefault: {
    type: Boolean,
    default: false,
  },
  placeholders: {
    type: [String],
    default: ["recruiter_name", "job_role", "company_name", "skills", "experience_summary", "user_name"],
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

emailTemplateSchema.pre('save', function() {
  this.updatedAt = new Date();
});

emailTemplateSchema.index({ userId: 1 });
emailTemplateSchema.index({ isDefault: 1 });

export default mongoose.model<IEmailTemplate>("EmailTemplate", emailTemplateSchema);
