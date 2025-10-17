import { Request, Response } from "express"
import User from "../models/user";

export const checkStatus = async (req: Request, res: Response) => {
    const claimer = req.body.claimerAddress;
    console.log(claimer);

    try {
        const user: any = await User.findOne({ userAddress: claimer});
        const currentTime = Date.now();

        if (user){
            const lastClaimtime = user.lastClaimtime;
            const day = 24 * 60 * 60 * 1000;
            const nextClaimTime = lastClaimtime + day;

            let remaingTime = nextClaimTime - currentTime;

            return res.status(200).json({
                statusCode: 200,
                message: "You can claim token only after 24 hours from your last claim.",
                success: true,
                data: {
                    remaingTime: remaingTime
                }
            });
        } else {
            return res.status(400).json({
                statusCode: 400,
                message: "User not found.",
                success: false
            })
        }
    } catch (error) {
        console.error("Error in checking status", error);
        return res.status(500).json({
            statusCode: 500,
            message: "Something went wrong",
            success: false
        });
    }
};