import mongoose, { Document, Schema } from "mongoose";

export interface IColdEmailLog extends Document {
  userId: mongoose.Types.ObjectId;
  recruiterEmail: string;
  jobId: mongoose.Types.ObjectId;
  status: string;
  errorMessage: string;
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
  jobId: {
    type: Schema.Types.ObjectId,
    ref: "Job",
    default: null,
  },
  status: {
    type: String,
    default: "sent",
  },
  errorMessage: {
    type: String,
    default: null,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model<IColdEmailLog>("ColdEmailLog", coldEmailLogSchema);
