import mongoose, { Document, Schema } from "mongoose";

export interface IJob extends Document {
  recruiterId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  requiredSkills: string[];
  location: string;
  salary: string;
  isActive: boolean;
  createdAt: Date;
}

const jobSchema = new Schema<IJob>({
  recruiterId: {
    type: Schema.Types.ObjectId,
    ref: "Recruiter",
    required: true,
  },
  title: {
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
  salary: {
    type: String,
    default: null,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model<IJob>("Job", jobSchema);
