import User from "../models/user";
import { Request , Response } from "express";

export const ClaimToken = async (req : Request , res: Response) => {
    const claimer = await req.body.claimerAddress;

    try {
        const user: any = await User.findOne({collecter: claimer});
        if (user){
            let lastClaimtime : number = user.lastClaimtime;
            let currentTime = Date.now();
            let day = 24 * 60 * 60 * 1000;

            if (lastClaimtime + day < currentTime){
                return res.status(400).json(
                    {
                        message: "You Can claim token is 24 hours after your last claim",
                        success: false
                    }
                )
            }else {
                return res.status(200).json({
                    message: "You claim token successfully",
                    success: true
                })
            }
        }else {
            const newUser = new User({
                userAddress: claimer,
                bowser: req.headers["user-agent"],
                ip: req.ip,
                lastClaimtime: Date.now(),
            })

            await newUser.save();
            return res.status(201).json({
                message: "You cliam token successfully",
                success: true
            })
        }
    } catch (error) {
        return res.status(500).json({
            message: "Someting wetns wrong",
            success: false
        })
    }
}