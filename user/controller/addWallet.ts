import { Request, Response } from "express";
import User from "../models/user";
import { SolanaService } from "../../services/solanaService";
import { ethers } from "ethers";

export const addWallet = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { email, network, walletAddress } = req.body;

    // Validate inputs
    if (!email || typeof email !== "string") {
      return res.status(400).json({
        statusCode: 400,
        success: false,
        message: "Email is required.",
      });
    }

    if (!network || typeof network !== "string") {
      return res.status(400).json({
        statusCode: 400,
        success: false,
        message: "Network is required ('solana' or 'sepolia').",
      });
    }

    if (!walletAddress || typeof walletAddress !== "string") {
      return res.status(400).json({
        statusCode: 400,
        success: false,
        message: "Wallet address is required.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedNetwork = network.trim().toLowerCase();
    const normalizedWallet = walletAddress.trim();

    if (!["solana", "sepolia"].includes(normalizedNetwork)) {
      return res.status(400).json({
        statusCode: 400,
        success: false,
        message: `Unsupported network '${normalizedNetwork}'. Supported networks are 'solana' and 'sepolia'.`,
      });
    }

    // Validate wallet format per chain
    if (normalizedNetwork === "solana") {
      if (!SolanaService.isValidAddress(normalizedWallet)) {
        return res.status(400).json({
          statusCode: 400,
          success: false,
          message: "Invalid Solana wallet address format.",
        });
      }
    } else if (normalizedNetwork === "sepolia") {
      if (!ethers.isAddress(normalizedWallet)) {
        return res.status(400).json({
          statusCode: 400,
          success: false,
          message: "Invalid Sepolia Ethereum wallet address format.",
        });
      }
    }

    // Find the user by email
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(404).json({
        statusCode: 404,
        success: false,
        message: "User not found. Please register your email first.",
      });
    }

    // Prevent another user from claiming with this same wallet address
    const existingOtherUser = await User.findOne({
      email: { $ne: normalizedEmail },
      "wallets.address": normalizedWallet,
    });

    if (existingOtherUser) {
      return res.status(409).json({
        statusCode: 409,
        success: false,
        message:
          "This wallet address is already linked to another registered email account.",
      });
    }

    // Check if user already has a wallet registered for this network
    const walletIndex = user.wallets.findIndex(
      (w) => w.network.toLowerCase() === normalizedNetwork
    );

    if (walletIndex >= 0) {
      // Update existing wallet address for this network
      user.wallets[walletIndex].address = normalizedWallet;
      user.wallets[walletIndex].addedAt = new Date();
    } else {
      // Add new wallet for this network
      user.wallets.push({
        network: normalizedNetwork as "solana" | "sepolia",
        address: normalizedWallet,
        addedAt: new Date(),
      });
    }

    await user.save();

    return res.status(200).json({
      statusCode: 200,
      success: true,
      message: `Wallet address successfully linked to ${normalizedEmail} for ${normalizedNetwork}.`,
      data: {
        email: user.email,
        network: normalizedNetwork,
        walletAddress: normalizedWallet,
        allWallets: user.wallets,
      },
    });
  } catch (error: any) {
    console.error("Error in addWallet:", error);
    return res.status(500).json({
      statusCode: 500,
      success: false,
      message: "Internal server error while linking wallet address.",
      error: error.message,
    });
  }
};

