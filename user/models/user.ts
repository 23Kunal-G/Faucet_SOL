import mongoose, { Schema } from "mongoose";

const UserSchema = new Schema<any>(
    {
        userAddress: {
            type: String,
            required: true,
        },
        browser: {
            type: String,
        },
        ip: {
            type: String,
        },
        lastClaimtime: {
            type: Number,
            required: true,
        },
    }
);

const User = mongoose.model("user", UserSchema);

export default User;