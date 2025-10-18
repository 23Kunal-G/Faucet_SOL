import mongoose from "mongoose";

export interface IAdmin extends mongoose.Document {
    faucetTokenAddress: string;
    claimAmount: number;
    claimIntervalHours: number;
    totalUsers: number;
    totalClaims: number;
    totalTokensDistributed: number;
    faucetWalletBalance: number;
    lastUpdated: number
}