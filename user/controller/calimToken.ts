import UserSchema from "../models/user";
import { Request , Response } from "express";

export const ClaimTokenRoute = async (req : Request , res: Response) => {
    const claimer = await req.body.claimerAddress;

    let user = await UserSchema.findOne({collector: claimer});
}