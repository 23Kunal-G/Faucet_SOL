import mongoose, { Schema } from "mongoose";
import { IUser } from "../../interface/userInterface";

const UserSchema = new Schema<IUser>(
    {
        userAddress: {
            type: String,
            required: true,
            unique: true
        },
        userAgent: {
            type: String,
        },
        ip: {
            type: String,
        },
        lastClaimTime: {
            type: Number,
        },
        nextClaimTime: {
            type: Number,
        },
        txHash: {
            type: String,
        },
        totalClaims: {
            type: Number,
            default: 0
        },
        totalTokensClaimed: {
            type: Number,
            default: 0
        },
        lastClaimedTime: {
            type: Number,
        },
        walletBalanceAtClaim: {
            type: Number,
        },
        status: {
            type: String,
        },
        country: {
            type: String,
        },
        deviceType: {
            type: String,
        },
        createdAt: {
            type: Number,
            default: Date.now(),
        },
        updatedAt: {
            type: Number,
            default: Date.now(),
        },
    },
);

const User = mongoose.model("user", UserSchema);

export default User;