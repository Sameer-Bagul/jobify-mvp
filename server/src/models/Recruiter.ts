import mongoose, { Document, Schema } from "mongoose";

export interface IRecruiter extends Document {
  userId: mongoose.Types.ObjectId;
  companyName: string;
  recruiterName: string;
  recruiterEmail: string;
  createdAt: Date;
}

const recruiterSchema = new Schema<IRecruiter>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
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
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model<IRecruiter>("Recruiter", recruiterSchema);
