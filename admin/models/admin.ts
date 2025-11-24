import mongoose, { Schema } from "mongoose";
import { networkConfigSchema } from "./networkConfig";
import { IAdmin } from "../../interface/adminInterfcae";

const adminSchema = new mongoose.Schema<IAdmin>(
  {
    // ADMIN ADDRESS
    adminAddress: {
      type: String,
      required: true,
      unique: true,
    },

    // MULTI-NETWORK CONFIGURATION  (solana + sepolia)
    networks: {
      type: [networkConfigSchema],
      default: [],
    },

    // GLOBAL ANTI-ABUSE PROTECTION
    abuseProtection: {
      blockVPNUsers: { type: Boolean, default: false },
      blockIncognito: { type: Boolean, default: false },
      blockMultipleDevices: { type: Boolean, default: false },
      checkIP: { type: Boolean, default: true },
      checkUserAgent: { type: Boolean, default: true },

      flaggedUsers: [
        {
          walletAddress: String,
          reason: String,
          flaggedAt: { type: Date, default: Date.now },
        },
      ],
    },

    // GLOBAL SYSTEM STATS (NOT PER-NETWORK)
    totalUsers: { type: Number, default: 0 },
    totalClaims: { type: Number, default: 0 },

    // GLOBAL RECENT TRANSACTIONS (optional)
    recentTransactions: [
      {
        txHash: String,
        claimerAddress: String,
        claimedAt: Date,
        amount: String,
      },
    ],

    // RELATION TO USERS
    users: [
      {
        type: Schema.Types.ObjectId,
        ref: "user",
      },
    ],

    // ADMIN META
    lastUpdated: {
      type: Number,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const Admin = mongoose.model("admin", adminSchema);

export default Admin;
