import User from "../models/user";
import Admin from "../../admin/models/admin";
import { Request, Response } from "express";

export const ClaimToken = async (req: Request, res: Response) => {
  const claimer = req.body.claimerAddress;

  try {
    const user: any = await User.findOne({ userAddress: claimer });
    const currentTime = Date.now();
    const day = 24 * 60 * 60 * 1000;

    if (user) {
      const lastClaimtime = user.lastClaimtime;

      if (currentTime - lastClaimtime < day) {
        return res.status(400).json({
          message: "You can claim tokens only after 24 hours from your last claim.",
          success: false,
        });
      }

      // ✅ Update claim time
      user.lastClaimtime = currentTime;
      await user.save();

      await Admin.updateOne(
        {},
        {
          $inc: {
            totalClaims: +1, 
            totalTokensDistributed: +2,
            lastUpdated: currentTime,
            faucetWalletBalance: -2
          }
        }
      );

      return res.status(200).json({
        message: "You claimed tokens successfully.",
        success: true,
      });
    } else {
      const newUser = new User({
        userAddress: claimer,
        userAgent: req.headers["user-agent"],
        ip: req.ip,
        lastClaimtime: currentTime,
        nextClaimTime: currentTime + day,
        txHash: ''
      });

      await newUser.save();

      await Admin.updateOne(
        {},
        {
          $inc: {
            totalUsers: +1,
            totalClaims: +1, 
            totalTokensDistributed: +2,
            lastUpdated: currentTime,
            faucetWalletBalance: -2
          }
        }
      );

      return res.status(201).json({
        message: "You claimed tokens successfully.",
        success: true,
      });
    }
  } catch (error) {
    console.error("Error in ClaimToken:", error);
    return res.status(500).json({
      message: "Something went wrong.",
      success: false,
    });
  }
};
