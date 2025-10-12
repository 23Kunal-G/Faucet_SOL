import { Schema } from "mongoose";

const UserSchema = new Schema<any>(
    {
        collecter:{
            type: String,
            required: true,
        },
        browser: {
            type: String,
        },
        ip: {
            type: String,
        },
        claimTime: {
            type: Number,
            required: true,
        },
    }
);

export default UserSchema;