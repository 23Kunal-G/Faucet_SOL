import mongoose from "mongoose";

const adminSchema = new mongoose.Schema<any>(
    {
        adminAddress: {
            type: String,
            required: true,
        },
        totalNumberOfTokens: {
            type: Number,
            required: true,
        },
        totalNumberOfClaims: {
            type: Number,
            required: true,
        }, 
    }
);

const Admin = mongoose.model("admin", adminSchema);

export default Admin;