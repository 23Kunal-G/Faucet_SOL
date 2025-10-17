import { Request, Response } from "express";
import Admin from "../models/admin";

export const adminUpdate = async (req: Request, res: Response) => {
    const adminAddress = req.body.adminAddress;
}