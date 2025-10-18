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

const adminSchema = new mongoose.Schema<IAdmin>(
    {
        faucetTokenAddress: {
            type: String,
        },
        claimAmount: {
            type: Number,
            default: 2,
        },
        claimIntervalHours: {
            type: Number,
            default: 24,
        },
        totalUsers: {
            type: Number,
            default: 0
        },
        totalClaims:{
            type: Number,
            default: 0
        },
        totalTokensDistributed: {
            type: Number,
            default: 0
        },
        faucetWalletBalance: {
            type: Number,
            default: 0
        },
        lastUpdated: {
            type: Number,
            default: Date.now()
        }
    }
);

const Admin = mongoose.model("admin", adminSchema);

export default Admin;