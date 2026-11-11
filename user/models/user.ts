import mongoose, { Schema } from "mongoose";
import { IUser } from "../../interface/userInterface";

const UserWalletSchema = new Schema(
  {
    network: {
      type: String,
      required: true,
      enum: ["solana", "sepolia"],
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    addedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const NetworkCooldownSchema = new Schema(
  {
    network: {
      type: String,
      required: true,
      enum: ["solana", "sepolia"],
    },
    lastClaimTime: {
      type: Number,
      default: 0,
    },
    nextClaimTime: {
      type: Number,
      default: 0,
    },
    totalClaims: {
      type: Number,
      default: 0,
    },
    totalTokensClaimed: {
      type: Number,
      default: 0,
    },
  },
  { _id: false }
);

const ClaimRecordSchema = new Schema(
  {
    network: {
      type: String,
      required: true,
      enum: ["solana", "sepolia"],
    },
    walletAddress: {
      type: String,
      required: true,
    },
    claimTime: {
      type: Number,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    txHash: {
      type: String,
      default: "",
    },
    ip: {
      type: String,
      default: "",
    },
    userAgent: {
      type: String,
      default: "",
    },
  },
  { _id: false }
);

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    wallets: {
      type: [UserWalletSchema],
      default: [],
    },
    networkCooldowns: {
      type: [NetworkCooldownSchema],
      default: [],
    },
    claims: {
      type: [ClaimRecordSchema],
      default: [],
    },

    // Security & Anti-Abuse
    ip: {
      type: String,
      default: "",
    },
    ipHistory: {
      type: [String],
      default: [],
    },
    userAgent: {
      type: String,
      default: "",
    },
    isIncognitoDetected: {
      type: Boolean,
      default: false,
    },
    isFlagged: {
      type: Boolean,
      default: false,
    },
    flagReason: {
      type: String,
      default: "",
    },
    admin: {
      type: Schema.Types.ObjectId,
      ref: "admin",
      required: false,
    },
  },
  { timestamps: true }
);

// Helpful index to search for registered wallets quickly
UserSchema.index({ "wallets.address": 1 });

const User = mongoose.model<IUser>("user", UserSchema);

export default User;
