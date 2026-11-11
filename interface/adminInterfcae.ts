import mongoose, { Schema } from "mongoose";
import { INetworkConfig } from "./networkConficInterface";

export interface IAdmin extends mongoose.Document {
  ownerAddress: string;

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
      walletAddress?: string;
      email?: string;
      ip?: string;
      reason: string;
      flaggedAt: Date;
    }[];
  };

  // System statistics
  totalUsers: number;
  totalClaims: number;

  // Logs / monitoring
  recentTransactions: Array<{
    txHash: string;
    claimerAddress: string;
    claimedAt: Date;
    amount: string;
  }>;

  // Relation to user model
  users: Schema.Types.ObjectId[];

  // System metadata
  lastUpdated: number;
}
