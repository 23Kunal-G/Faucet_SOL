import { Request, Response } from "express";
import Admin from "../models/admin";

export const adminUpdate = async (req: Request, res: Response) => {
    const adminAddress = req.body.adminAddress;

    try {
        let admin = await Admin.findOne({ adminAddress: adminAddress});

        if (!admin){
           
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