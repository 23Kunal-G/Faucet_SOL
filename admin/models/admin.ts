import mongoose from "mongoose";
import { IAdmin } from "../../interface/adminInterfcae";

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