import mongoose, { Document, Schema } from "mongoose";

export interface ISavedItem extends Document {
  userId: mongoose.Types.ObjectId;
  itemType: "job" | "recruiter";
  itemId: mongoose.Types.ObjectId;
  notes: string;
  reminder: Date | null;
  createdAt: Date;
}

const savedItemSchema = new Schema<ISavedItem>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  itemType: {
    type: String,
    enum: ["job", "recruiter"],
    required: true,
  },
  itemId: {
    type: Schema.Types.ObjectId,
    required: true,
    refPath: "itemType",
  },
  notes: {
    type: String,
    default: null,
  },
  reminder: {
    type: Date,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

savedItemSchema.index({ userId: 1, itemType: 1 });
savedItemSchema.index({ userId: 1, itemId: 1 }, { unique: true });

export default mongoose.model<ISavedItem>("SavedItem", savedItemSchema);
