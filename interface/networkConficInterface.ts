import mongoose from "mongoose";

export interface INetworkConfig extends mongoose.Document {
  networkName: string; // "solana" | "sepolia"

  // Addresses
  faucetWalletAddress: string;
  contractAddress?: string; // ETH only
  programId?: string;       // Solana only

  // Claim rules
  claimAmount: number;
  claimIntervalHours: number;
  maxDailyClaims: number;

  // Stats / analytics
  totalClaims: number;
  totalUniqueClaimers: number;
  totalTokensDistributed: number;

  // Monitoring
  latestWalletBalance: number;
  isFaucetActive: boolean;
  lastHealthCheck: number;
  errorLogs: string[];

  // Logs / transactions
  recentTransactions: {
    txHash: string;
    claimerAddress: string;
    claimedAt: Date;
    amount: number;
    ipAddress?: string;
    userAgent?: string;
  }[];
}