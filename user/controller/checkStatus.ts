import { Request, Response } from "express";
import User from "../models/user";
import { AntiAbuseService } from "../../security/antiAbuse";

function formatRemainingTime(ms: number): string {
  if (ms <= 0) return "Ready to claim";
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const parts = [];
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  parts.push(`${seconds}s`);

  return parts.join(" ");
}

export const checkStatus = async (req: Request, res: Response): Promise<Response> => {
  try {
    // Support query parameters (standard for GET) and body (for legacy callers)
    const email = (
      (req.query.email as string) ||
      (req.body?.email as string) ||
      ""
    ).trim().toLowerCase();

    const network = (
      (req.query.network as string) ||
      (req.body?.network as string) ||
      "solana"
    ).trim().toLowerCase();

    const walletAddress = (
      (req.query.walletAddress as string) ||
      (req.query.address as string) ||
      (req.body?.walletAddress as string) ||
      (req.body?.claimerAddress as string) ||
      ""
    ).trim();

    if (!email && !walletAddress) {
      return res.status(400).json({
        statusCode: 400,
        success: false,
        message: "Please provide an email or wallet address to check status.",
      });
    }

    const currentTime = Date.now();
    const DAY_MS = 24 * 60 * 60 * 1000;

    let user = null;
    if (email) {
      user = await User.findOne({ email });
    } else if (walletAddress) {
      user = await User.findOne({ "wallets.address": walletAddress });
    }

    if (!user) {
      return res.status(404).json({
        statusCode: 404,
        success: false,
        message: "No registered user found for the provided credentials.",
        data: {
          canClaim: false,
          isRegistered: false,
        },
      });
    }

    // Check linked wallet for the specified network
    const linkedWallet = user.wallets.find(
      (w) => w.network.toLowerCase() === network
    );

    if (!linkedWallet) {
      return res.status(200).json({
        statusCode: 200,
        success: true,
        message: `User is registered, but no ${network} wallet is linked yet.`,
        data: {
          canClaim: false,
          isRegistered: true,
          email: user.email,
          hasWalletForNetwork: false,
          allWallets: user.wallets,
        },
      });
    }

    // If walletAddress was provided, verify it matches
    if (walletAddress && walletAddress.toLowerCase() !== linkedWallet.address.toLowerCase()) {
      return res.status(400).json({
        statusCode: 400,
        success: false,
        message: `Wallet mismatch: ${walletAddress} is not the linked ${network} wallet for ${user.email}.`,
        data: {
          canClaim: false,
          registeredWallet: linkedWallet.address,
        },
      });
    }

    // Cooldown check for user on this network
    const cooldownInfo = user.networkCooldowns.find(
      (c) => c.network.toLowerCase() === network
    );

    let lastClaimTime = cooldownInfo?.lastClaimTime || 0;
    let nextClaimTime = cooldownInfo?.nextClaimTime || 0;

    // Also check global wallet claims across DB to prevent bypassing via new accounts
    const recentWalletClaim = await User.findOne({
      "claims.network": network,
      "claims.walletAddress": linkedWallet.address,
      "claims.claimTime": { $gt: currentTime - DAY_MS },
    });

    if (recentWalletClaim) {
      // Find the most recent claim timestamp for this wallet
      const matchingClaims = recentWalletClaim.claims.filter(
        (c) =>
          c.network.toLowerCase() === network &&
          c.walletAddress.toLowerCase() === linkedWallet.address.toLowerCase()
      );
      if (matchingClaims.length > 0) {
        const latestTime = Math.max(...matchingClaims.map((c) => c.claimTime));
        if (latestTime > lastClaimTime) {
          lastClaimTime = latestTime;
          nextClaimTime = latestTime + DAY_MS;
        }
      }
    }

    const isCooldownActive = currentTime < nextClaimTime;
    const remainingMs = isCooldownActive ? nextClaimTime - currentTime : 0;

    // Check IP rate limits
    const clientIp =
      (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
      req.ip ||
      "";
    const ipCheck = await AntiAbuseService.verifyIPLimits(clientIp, network);

    const canClaim = !isCooldownActive && ipCheck.allowed && !user.isFlagged;

    return res.status(200).json({
      statusCode: 200,
      success: true,
      message: canClaim
        ? "You are eligible to claim tokens."
        : isCooldownActive
        ? `Claim cooldown is active. Please wait ${formatRemainingTime(remainingMs)}.`
        : ipCheck.reason || "Unable to claim at this time.",
      data: {
        canClaim,
        email: user.email,
        network,
        registeredWallet: linkedWallet.address,
        lastClaimTime,
        nextClaimTime,
        remainingTimeMs: remainingMs,
        remainingFormatted: formatRemainingTime(remainingMs),
        totalClaimsOnNetwork: cooldownInfo?.totalClaims || 0,
        isFlagged: user.isFlagged,
      },
    });
  } catch (error: any) {
    console.error("Error in checkStatus:", error);
    return res.status(500).json({
      statusCode: 500,
      success: false,
      message: "Internal server error while checking claim status.",
      error: error.message,
    });
  }
};
