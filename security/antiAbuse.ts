import { Request } from "express";
import Admin from "../admin/models/admin";
import IPRecord from "../user/models/ipTracker";

export interface AntiAbuseResult {
  allowed: boolean;
  statusCode?: number;
  reason?: string;
}

export class AntiAbuseService {
  /**
   * Detects whether request is originating from Incognito/Private mode
   * and verifies against admin policy.
   */
  public static async verifyIncognito(
    req: Request,
    isIncognitoFlag?: boolean
  ): Promise<AntiAbuseResult> {
    const admin = await Admin.findOne();
    const shouldBlockIncognito = admin?.abuseProtection?.blockIncognito ?? true;

    // Detection through header or body payload sent by client anti-abuse check
    const headerIncognito =
      req.headers["x-is-incognito"] === "true" ||
      req.headers["x-is-incognito"] === "1";
    const bodyIncognito = isIncognitoFlag === true;

    const isIncognito = headerIncognito || bodyIncognito;

    if (isIncognito && shouldBlockIncognito) {
      return {
        allowed: false,
        statusCode: 403,
        reason:
          "Incognito/Private browsing mode is restricted. Please use a regular browser session to claim faucet tokens.",
      };
    }

    return { allowed: true };
  }

  /**
   * Verifies User-Agent to block headless scripts/crawlers without legitimate browser context.
   */
  public static async verifyUserAgent(req: Request): Promise<AntiAbuseResult> {
    const admin = await Admin.findOne();
    const checkUserAgent = admin?.abuseProtection?.checkUserAgent ?? true;

    if (!checkUserAgent) {
      return { allowed: true };
    }

    const userAgent = req.headers["user-agent"];

    if (!userAgent || typeof userAgent !== "string" || userAgent.trim() === "") {
      return {
        allowed: false,
        statusCode: 400,
        reason: "User-Agent header is missing or invalid.",
      };
    }

    const suspiciousKeywords = ["curl/", "python-requests", "postmanruntime/"];
    const isSuspicious = suspiciousKeywords.some((keyword) =>
      userAgent.toLowerCase().includes(keyword)
    );

    if (isSuspicious) {
      return {
        allowed: false,
        statusCode: 403,
        reason: "Automated scripts and CLI requests are not permitted to claim tokens directly.",
      };
    }

    return { allowed: true };
  }

  /**
   * Checks whether the email, wallet address, or IP has been flagged or blacklisted by admin.
   */
  public static async verifyFlaggedStatus(
    email: string,
    walletAddress: string,
    ip: string
  ): Promise<AntiAbuseResult> {
    const admin = await Admin.findOne();
    const flaggedList = admin?.abuseProtection?.flaggedUsers || [];

    const isWalletFlagged = flaggedList.some(
      (f: any) =>
        f.walletAddress &&
        f.walletAddress.toLowerCase() === walletAddress.toLowerCase()
    );

    if (isWalletFlagged) {
      return {
        allowed: false,
        statusCode: 403,
        reason: "This wallet address has been flagged for suspicious activity.",
      };
    }

    return { allowed: true };
  }

  /**
   * IP-based rate limiting to prevent multi-wallet draining from the same IP within 24 hours.
   */
  public static async verifyIPLimits(
    ip: string,
    network: string,
    maxAllowedClaims: number = 3
  ): Promise<AntiAbuseResult> {
    const admin = await Admin.findOne();
    const checkIP = admin?.abuseProtection?.checkIP ?? true;

    if (!checkIP || !ip) {
      return { allowed: true };
    }

    const now = Date.now();
    const dayAgo = now - 24 * 60 * 60 * 1000;

    const record = await IPRecord.findOne({ ip, network });

    if (record) {
      if (record.isBlocked) {
        return {
          allowed: false,
          statusCode: 403,
          reason: `Access blocked for this IP address: ${record.blockReason || "Suspicious behavior"}`,
        };
      }

      // Filter timestamps from the last 24h
      const activeClaims = record.claimTimestamps.filter((t) => t > dayAgo);

      if (activeClaims.length >= maxAllowedClaims) {
        const oldestClaim = Math.min(...activeClaims);
        const cooldownRemaining = 24 * 60 * 60 * 1000 - (now - oldestClaim);
        const hoursRemaining = Math.ceil(cooldownRemaining / (1000 * 60 * 60));

        return {
          allowed: false,
          statusCode: 429,
          reason: `Too many claim attempts from this IP address on ${network}. Maximum ${maxAllowedClaims} claims per 24 hours per IP. Try again in approximately ${hoursRemaining} hour(s).`,
        };
      }
    }

    return { allowed: true };
  }

  /**
   * Logs a successful claim against the IP tracker.
   */
  public static async recordClaim(ip: string, network: string): Promise<void> {
    if (!ip) return;

    const now = Date.now();
    const dayAgo = now - 24 * 60 * 60 * 1000;

    let record = await IPRecord.findOne({ ip, network });

    if (!record) {
      record = new IPRecord({
        ip,
        network,
        claimTimestamps: [now],
        lastClaimTime: now,
      });
    } else {
      // Keep only last 24 hours plus new claim
      record.claimTimestamps = record.claimTimestamps.filter((t) => t > dayAgo);
      record.claimTimestamps.push(now);
      record.lastClaimTime = now;
    }

    await record.save();
  }
}

