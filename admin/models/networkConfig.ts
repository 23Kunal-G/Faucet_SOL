import mongoose from "mongoose";
import { INetworkConfig } from "../../interface/networkConficInterface";

export const networkConfigSchema = new mongoose.Schema<INetworkConfig>(
  {
    networkName: {
      type: String,
      required: true,
      enum: ["solana", "sepolia"],
    },

    // Addresses
    adminAddress: { type: String, required: true },
    faucetWalletAddress: { type: String, required: true },
    contractAddress: { type: String },

    // Claim rules
    claimAmount: { type: Number, required: true },
    claimIntervalHours: { type: Number, default: 24 },
    maxDailyClaims: { type: Number, default: 1 },

    // Stats
    totalClaims: { type: Number, default: 0 },
    totalUniqueClaimers: { type: Number, default: 0 },
    totalTokensDistributed: { type: Number, default: 0 },

    // Monitoring
    latestWalletBalance: { type: Number, default: 0 },
    isFaucetActive: { type: Boolean, default: false },
    lastHealthCheck: { type: Number, default: Date.now },

    // Logging transactions
    recentTransactions: {
      transactions: [
        {
          txHash: String,
          claimerAddress: String,
          claimedAt: Date,
          amount: String,
          ipAddress: String,
          userAgent: String,
        },
      ],
      default: [],
    },
  },
  { _id: false }
);
