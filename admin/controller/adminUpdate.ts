import { Request, Response } from "express";
import Admin from "../models/admin";

export const adminUpdate = async (req: Request, res: Response) => {
    const adminAddress = req.body.adminAddress;

    try {
        let admin = await Admin.findOne({ adminAddress: adminAddress});

        if (!admin){

        }
    } catch (error) {
        
    }
}