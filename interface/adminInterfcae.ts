import mongoose from "mongoose";

export interface IAdmin extends mongoose.Document {
  adminAddress: string;

  // Faucet configurations
  faucetTokenAddress: string;
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
}
