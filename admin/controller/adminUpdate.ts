import { Request, Response } from "express";
import Admin from "../models/admin";

export const adminUpdate = async (req: Request, res: Response) => {
    const adminAddress = req.body.adminAddress;

    try {
        let admin = await Admin.findOne({ adminAddress: adminAddress});

        if (!admin){
            admin = new Admin({
                adminAddress: adminAddress,
                
                faucetTokenAddress: admin,
                claimAmount: 0,
                claimIntervalHours: 0,
                maxDailyClaims: 0,
                totalUsers: 0,
                totalClaims: 0,
                totalTokensDistributed: 0,
                totalActiveUsers: 0,
                latestWalletBalance: 0,
                faucetWalletAddress: "",
                recentTransactions: [],

                lastUpdated: Date.now(),
                systemHealth: {
                    faucetOnline: false,
                    lastPayoutCheck: Date.now(),
                    errorLogs: [],
                }
            });

            await admin.save();
            return res.status(201).json({
                statusCode: 201,
                message: "Admin created successfully",
                success: true
            })
        }else {
            return res.status(200).json({
                statusCode: 200,
                message: "admin updated successfully",
                success: true
            })
        }
    } catch (error) {
        console.error("Error updating admin:",error);
        return res.status(500).json({
            statusCode: 500,
            message: "Error updating admin",
            success: false
        })
    }
}