import mongoose from "mongoose"
export interface IUser extends mongoose.Document {
    userAddress: string,
    userAgent: string,
    ip: string,
    lastClaimTime: number,
    nextClaimTime: number,
    txHash: string,

    // Faucet-specific fields
    totalClaims: number,
    totalTokensClaimed: number,
    lastClaimedTime: number,
    walletBalanceAtClaim: number,
    status: string,
    
    // Analytics fields
    country: string,
    deviceType: string,
    createdAt: number,
    updatedAt: number
}