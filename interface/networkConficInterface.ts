import mongoose from "mongoose";

export interface INetworkConfig extends mongoose.Document {
  networkName: string;                 // e.g., "sepolia", "solana"

  adminAddress: string;                // admin wallet for that network
  faucetWalletAddress: string;         // faucet sender address
  contractAddress: string;             // faucet contract address (if EVM)

  // Claim rules
  claimAmount: number;                 // custom per network
  claimIntervalHours: number;          // custom per network
  maxDailyClaims: number;              // custom per network

  // Stats
  totalClaims: number;                 // updated dynamically
  totalUniqueClaimers: number;         // updated dynamically
  totalTokensDistributed: number;      // updated dynamically

  // Monitoring
  latestWalletBalance: number;         // updated dynamically
  isFaucetActive: boolean;
  lastHealthCheck: Number;

  recentTransactions: [
    {
      txHash: string;
      claimerAddress: string;
      claimedAt: Date;
      amount: string;
      ipAddress: string;
      userAgent: string;
    }
  ];
}