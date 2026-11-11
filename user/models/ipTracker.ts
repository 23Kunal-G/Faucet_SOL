import mongoose, { Schema, Document } from "mongoose";

export interface IIPRecord extends Document {
  ip: string;
  network: string;
  claimTimestamps: number[];
  lastClaimTime: number;
  isBlocked: boolean;
  blockReason?: string;
}

const IPRecordSchema = new Schema<IIPRecord>(
  {
    ip: {
      type: String,
      required: true,
      index: true,
    },
    network: {
      type: String,
      required: true,
      enum: ["solana", "sepolia"],
    },
    claimTimestamps: {
      type: [Number],
      default: [],
    },
    lastClaimTime: {
      type: Number,
      default: 0,
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    blockReason: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

// Compound index for fast lookup
IPRecordSchema.index({ ip: 1, network: 1 }, { unique: true });

const IPRecord = mongoose.model<IIPRecord>("ipRecord", IPRecordSchema);

export default IPRecord;

