import mongoose, { Schema } from "mongoose";

export interface IUserWallet {
  network: "solana" | "sepolia";
  address: string;
  addedAt: Date;
}

export interface INetworkCooldown {
  network: "solana" | "sepolia";
  lastClaimTime: number;
  nextClaimTime: number;
  totalClaims: number;
  totalTokensClaimed: number;
}

export interface IClaimRecord {
  network: "solana" | "sepolia";
  walletAddress: string;
  claimTime: number;
  amount: number;
  txHash: string;
  ip: string;
  userAgent: string;
}

export interface IUser extends mongoose.Document {
  email: string;
  wallets: IUserWallet[];
  networkCooldowns: INetworkCooldown[];
  claims: IClaimRecord[];

  // Security & Anti-Abuse
  ip: string;
  ipHistory: string[];
  userAgent: string;
  isIncognitoDetected: boolean;
  isFlagged: boolean;
  flagReason?: string;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;

  // Optional admin reference
  admin?: Schema.Types.ObjectId;
}
