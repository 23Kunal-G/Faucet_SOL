import { Request, Response } from "express";
import User from "../models/user";
import Admin from "../../admin/models/admin";
import { AntiAbuseService } from "../../security/antiAbuse";
import { SolanaService } from "../../services/solanaService";

const DAY_MS = 24 * 60 * 60 * 1000;

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

export const claimToken = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { email, walletAddress, claimerAddress, isIncognito } = req.body;
    const network = (req.body.network || "solana").trim().toLowerCase();
    const targetWallet = (walletAddress || claimerAddress || "").trim();

    // 1. Basic Input Validation
    if (!email || typeof email !== "string") {
      return res.status(400).json({
        statusCode: 400,
        success: false,
        message: "Email address is required to claim faucet tokens.",
      });
    }

    if (!targetWallet) {
      return res.status(400).json({
        statusCode: 400,
        success: false,
        message: "Wallet address is required to claim faucet tokens.",
      });
    }

    if (!["solana", "sepolia"].includes(network)) {
      return res.status(400).json({
        statusCode: 400,
        success: false,
        message: `Network '${network}' is not supported. Use 'solana' or 'sepolia'.`,
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const clientIp =
      (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
      req.ip ||
      "";
    const userAgent = (req.headers["user-agent"] as string) || "";

    // 2. Anti-Abuse: Incognito Mode Check
    const incognitoCheck = await AntiAbuseService.verifyIncognito(
      req,
      isIncognito
    );
    if (!incognitoCheck.allowed) {
      return res.status(incognitoCheck.statusCode || 403).json({
        statusCode: incognitoCheck.statusCode || 403,
        success: false,
        message: incognitoCheck.reason,
      });
    }

    // 3. Anti-Abuse: User-Agent Check
    const userAgentCheck = await AntiAbuseService.verifyUserAgent(req);
    if (!userAgentCheck.allowed) {
      return res.status(userAgentCheck.statusCode || 403).json({
        statusCode: userAgentCheck.statusCode || 403,
        success: false,
        message: userAgentCheck.reason,
      });
    }

    // 4. Anti-Abuse: Blacklist / Flagged Entity Check
    const flaggedCheck = await AntiAbuseService.verifyFlaggedStatus(
      normalizedEmail,
      targetWallet,
      clientIp
    );
    if (!flaggedCheck.allowed) {
      return res.status(flaggedCheck.statusCode || 403).json({
        statusCode: flaggedCheck.statusCode || 403,
        success: false,
        message: flaggedCheck.reason,
      });
    }

    // 5. Anti-Abuse: IP-Based Claim Limit Check
    const ipCheck = await AntiAbuseService.verifyIPLimits(clientIp, network);
    if (!ipCheck.allowed) {
      return res.status(ipCheck.statusCode || 429).json({
        statusCode: ipCheck.statusCode || 429,
        success: false,
        message: ipCheck.reason,
      });
    }

    // 6. User Registration & Matching Verification
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(404).json({
        statusCode: 404,
        success: false,
        message:
          "User with this email is not registered. Please register first and link your wallet address.",
      });
    }

    // Find linked wallet for this network
    const linkedWallet = user.wallets.find(
      (w) => w.network.toLowerCase() === network
    );

    if (!linkedWallet) {
      return res.status(400).json({
        statusCode: 400,
        success: false,
        message: `No ${network} wallet is registered for ${normalizedEmail}. Please link your wallet first.`,
      });
    }

    // CRITICAL: Verify that the claimer's wallet address strictly matches the registered wallet
    if (linkedWallet.address.toLowerCase() !== targetWallet.toLowerCase()) {
      return res.status(403).json({
        statusCode: 403,
        success: false,
        message: `Wallet mismatch: ${targetWallet} does not match the registered ${network} wallet for ${normalizedEmail}.`,
      });
    }

    const currentTime = Date.now();

    // 7. 24-Hour Cooldown Verification for Email Account
    let cooldownIndex = user.networkCooldowns.findIndex(
      (c) => c.network.toLowerCase() === network
    );

    if (cooldownIndex >= 0) {
      const cooldown = user.networkCooldowns[cooldownIndex];
      if (currentTime < cooldown.nextClaimTime) {
        const remainingMs = cooldown.nextClaimTime - currentTime;
        return res.status(429).json({
          statusCode: 429,
          success: false,
          message: `Claim cooldown is active for this email on ${network}. Please wait ${formatRemainingTime(
            remainingMs
          )}.`,
          data: {
            remainingTimeMs: remainingMs,
            remainingFormatted: formatRemainingTime(remainingMs),
            nextClaimTime: cooldown.nextClaimTime,
          },
        });
      }
    }

    // 8. 24-Hour Cooldown Verification for Wallet Address (across whole system)
    const recentWalletClaim = await User.findOne({
      "claims.network": network,
      "claims.walletAddress": linkedWallet.address,
      "claims.claimTime": { $gt: currentTime - DAY_MS },
    });

    if (recentWalletClaim) {
      const claimsForWallet = recentWalletClaim.claims.filter(
        (c) =>
          c.network.toLowerCase() === network &&
          c.walletAddress.toLowerCase() === linkedWallet.address.toLowerCase()
      );
      if (claimsForWallet.length > 0) {
        const latestTime = Math.max(...claimsForWallet.map((c) => c.claimTime));
        const remainingMs = latestTime + DAY_MS - currentTime;
        if (remainingMs > 0) {
          return res.status(429).json({
            statusCode: 429,
            success: false,
            message: `This wallet address has already claimed tokens on ${network} within the last 24 hours. Please wait ${formatRemainingTime(
              remainingMs
            )}.`,
            data: {
              remainingTimeMs: remainingMs,
              remainingFormatted: formatRemainingTime(remainingMs),
              nextClaimTime: latestTime + DAY_MS,
            },
          });
        }
      }
    }

    // 9. Fetch Network Settings from Admin
    const admin = await Admin.findOne();
    const networkConfig = admin?.networks.find(
      (n: any) => n.networkName.toLowerCase() === network
    );

    const claimAmount = networkConfig?.claimAmount ?? (network === "solana" ? 2 : 1);

    // 10. Execute Blockchain Dispenser (Solana)
    let txHash = "";
    let explorerUrl = "";

    if (network === "solana") {
      try {
        const dispenseResult = await SolanaService.dispenseSOL(
          linkedWallet.address,
          claimAmount
        );
        txHash = dispenseResult.txHash;
        explorerUrl = dispenseResult.explorerUrl;
      } catch (dispenseErr: any) {
        console.error("Solana dispense error:", dispenseErr);
        return res.status(502).json({
          statusCode: 502,
          success: false,
          message: `Blockchain transaction failed: ${dispenseErr.message}`,
        });
      }
    } else {
      // Sepolia dispenser placeholder until Phase 2 is completed
      return res.status(501).json({
        statusCode: 501,
        success: false,
        message:
          "Sepolia dispenser is scheduled for Phase 2. Currently, the Solana faucet is fully active.",
      });
    }

    // 11. Record Successful Claim
    const nextClaimTime = currentTime + DAY_MS;

    if (cooldownIndex >= 0) {
      user.networkCooldowns[cooldownIndex].lastClaimTime = currentTime;
      user.networkCooldowns[cooldownIndex].nextClaimTime = nextClaimTime;
      user.networkCooldowns[cooldownIndex].totalClaims += 1;
      user.networkCooldowns[cooldownIndex].totalTokensClaimed += claimAmount;
    } else {
      user.networkCooldowns.push({
        network: network as "solana" | "sepolia",
        lastClaimTime: currentTime,
        nextClaimTime,
        totalClaims: 1,
        totalTokensClaimed: claimAmount,
      });
    }

    user.claims.push({
      network: network as "solana" | "sepolia",
      walletAddress: linkedWallet.address,
      claimTime: currentTime,
      amount: claimAmount,
      txHash,
      ip: clientIp,
      userAgent,
    });

    if (clientIp && !user.ipHistory.includes(clientIp)) {
      user.ipHistory.push(clientIp);
    }
    user.ip = clientIp;
    user.userAgent = userAgent;

    await user.save();

    // Record IP claim for rate-limiting
    await AntiAbuseService.recordClaim(clientIp, network);

    // Update Admin statistics for this network
    if (admin) {
      await Admin.updateOne(
        { "networks.networkName": network },
        {
          $inc: {
            "networks.$.totalClaims": 1,
            "networks.$.totalTokensDistributed": claimAmount,
            totalClaims: 1,
          },
          $set: {
            lastUpdated: currentTime,
          },
        }
      );
    }

    return res.status(200).json({
      statusCode: 200,
      success: true,
      message: `Successfully claimed ${claimAmount} ${network.toUpperCase()} tokens!`,
      data: {
        email: user.email,
        network,
        walletAddress: linkedWallet.address,
        amount: claimAmount,
        txHash,
        explorerUrl,
        claimedAt: currentTime,
        nextClaimTime,
        cooldownRemaining: formatRemainingTime(DAY_MS),
      },
    });
  } catch (error: any) {
    console.error("Error in claimToken:", error);
    return res.status(500).json({
      statusCode: 500,
      success: false,
      message: "An unexpected error occurred while processing your claim.",
      error: error.message,
    });
  }
};

