import mongoose, { Schema } from "mongoose";
import { INetworkConfig } from "./networkConficInterface";

export interface IAdmin extends mongoose.Document {
  adminAddress: {
    type: string;
    required: true;
    unique: true;
  };

  // Multinetwork Configuration
  networks: INetworkConfig[];

  // Global anti-abuse settings
  abuseProtection: {
    blockVPNUsers: boolean;
    blockIncognito: boolean;
    blockMultipleDevices: boolean;
    checkIP: boolean;
    checkUserAgent: boolean;

    flaggedUsers: {
      walletAddress: string;
      reason: string;
      flaggedAt: Date;
    }[];
  };

  // Faucet configurations
  contractAddress: string;
  claimAmount: number;
  claimIntervalHours: number;
  maxDailyClaims: number;

  //  System statistics
  totalUsers: number;
  totalClaims: number;

  // Logs / monitoring
  recentTransactions: [
    {
      txHash: String;
      claimerAddress: String;
      claimedAt: Date;
      amount: String;
    }
  ];

  // Relation to user model
  users: [Schema.Types.ObjectId];

  // System metadata
  lastUpdated: number;
}
