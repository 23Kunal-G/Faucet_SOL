import mongoose, { Schema } from "mongoose";

export interface IAdmin extends mongoose.Document {
  adminAddress: {
    type: string;
    required: true;
    unique: true;
  };

  // Faucet configurations
  contractAddress: string;
  claimAmount: number;
  claimIntervalHours: number;
  maxDailyClaims: number;

  //  System statistics
  totalUsers: number;
  totalClaims: number;
  totalTokensDistributed: number;
  totalActiveUsers: number;
  latestWalletBalance: number;
  faucetWalletAddress: string;

  // Logs / monitoring
  recentTransactions: [
    {
      txHash: String;
      claimerAddress: String;
      claimedAt: Date;
      amount: String;
    }
  ];

  // analytics
  lastUpdated: number;
  systemHealth: {
    faucetOnline: boolean;
    lastPayoutCheck: number;
    errorLogs: [string];
  };

  users: [
    {
      type: Schema.Types.ObjectId;
      ref: "User";
    }
  ];
}
