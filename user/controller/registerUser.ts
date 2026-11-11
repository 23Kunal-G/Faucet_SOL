import { Request, Response } from "express";
import User from "../models/user";
import Admin from "../../admin/models/admin";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const registerUser = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { email } = req.body;

    if (!email || typeof email !== "string") {
      return res.status(400).json({
        statusCode: 400,
        success: false,
        message: "Email address is required.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    if (!EMAIL_REGEX.test(normalizedEmail)) {
      return res.status(400).json({
        statusCode: 400,
        success: false,
        message: "Invalid email format. Please provide a valid email address.",
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return res.status(200).json({
        statusCode: 200,
        success: true,
        message: "User is already registered.",
        data: {
          email: existingUser.email,
          wallets: existingUser.wallets,
          registeredAt: existingUser.createdAt,
        },
      });
    }

    // Capture client info
    const clientIp =
      (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
      req.ip ||
      "";
    const userAgent = req.headers["user-agent"] || "";

    // Find global admin to optionally reference
    const admin = await Admin.findOne();

    const newUser = new User({
      email: normalizedEmail,
      wallets: [],
      networkCooldowns: [],
      claims: [],
      ip: clientIp,
      ipHistory: clientIp ? [clientIp] : [],
      userAgent,
      isIncognitoDetected: false,
      isFlagged: false,
      admin: admin?._id,
    });

    await newUser.save();

    // Increment admin totalUsers counter
    if (admin) {
      await Admin.updateOne(
        { _id: admin._id },
        { $inc: { totalUsers: 1 }, $set: { lastUpdated: Date.now() } }
      );
    }

    return res.status(201).json({
      statusCode: 201,
      success: true,
      message: "User registered successfully. You can now link your wallet address.",
      data: {
        email: newUser.email,
        wallets: newUser.wallets,
        createdAt: newUser.createdAt,
      },
    });
  } catch (error: any) {
    console.error("Error in registerUser:", error);
    return res.status(500).json({
      statusCode: 500,
      success: false,
      message: "Internal server error during registration.",
      error: error.message,
    });
  }
};

