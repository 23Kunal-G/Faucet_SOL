import mongoose, { Schema } from "mongoose";

export interface IUser extends mongoose.Document {
    userAddress: string,
    userAgent: string,
    ip: string,
    lastClaimTime: number,
    nextClaimTime: number,
    txHash: string
}

const UserSchema = new Schema<IUser>(
    {
        userAddress: {
            type: String,
            required: true,
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
        }
    }
);

const User = mongoose.model("user", UserSchema);

export default User;