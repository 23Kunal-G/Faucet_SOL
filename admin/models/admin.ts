import mongoose, { Schema } from "mongoose";
import { IAdmin } from "../../interface/adminInterfcae";

const adminSchema = new mongoose.Schema<IAdmin>({
  adminAddress: { type: String, required: true },

  // Faucet configurations
  contractAddress: {
    type: String,
  },
  claimAmount: {
    type: Number,
    default: 100,
  },
  claimIntervalHours: {
    type: Number,
    default: 24,
  },
  maxDailyClaims: {
    type: Number,
    default: 1,
  },

  // System configuration
  totalUsers: {
    type: Number,
    default: 0,
  },
  totalClaims: {
    type: Number,
    default: 0,
  },
  totalTokensDistributed: {
    type: Number,
    default: 0,
  },
  totalActiveUsers: {
    type: Number,
    default: 0,
  },
  latestWalletBalance: {
    type: Number,
    default: 0,
  },
  faucetWalletAddress: {
    type: String,
  },

  // monitoring
  recentTransactions: [
    {
      txHash: String,
      claimerAddress: String,
      claimedAt: Date,
      amount: String,
    },
  ],

  // analytics
  lastUpdated: {
    type: Number,
    default: Date.now(),
  },
  systemHealth: {
    faucetOnline: {
      type: Boolean,
      default: false,
    },
    lastPayoutCheck: {
      type: Number,
      default: Date.now(),
    },
    errorLogs: [String],
  },
  users: [
    {
      type: Schema.Types.ObjectId,
      ref: "user",
      default: null,
    },
  ],
});

const Admin = mongoose.model("admin", adminSchema);

export default Admin;
