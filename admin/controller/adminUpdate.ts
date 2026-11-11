import { Request, Response } from "express";
import Admin from "../models/admin";

export const adminUpdate = async (req: Request, res: Response): Promise<Response> => {
  const { ownerAddress, abuseProtection, networkUpdates } = req.body;

  try {
    let admin = ownerAddress
      ? await Admin.findOne({ ownerAddress })
      : await Admin.findOne();

    if (!admin) {
      return res.status(404).json({
        statusCode: 404,
        success: false,
        message: "Admin configuration not found.",
      });
    }

    // Update anti-abuse rules if supplied
    if (abuseProtection) {
      if (typeof abuseProtection.blockIncognito === "boolean") {
        admin.abuseProtection.blockIncognito = abuseProtection.blockIncognito;
      }
      if (typeof abuseProtection.checkIP === "boolean") {
        admin.abuseProtection.checkIP = abuseProtection.checkIP;
      }
      if (typeof abuseProtection.checkUserAgent === "boolean") {
        admin.abuseProtection.checkUserAgent = abuseProtection.checkUserAgent;
      }
      if (typeof abuseProtection.blockVPNUsers === "boolean") {
        admin.abuseProtection.blockVPNUsers = abuseProtection.blockVPNUsers;
      }
      if (Array.isArray(abuseProtection.flaggedUsers)) {
        admin.abuseProtection.flaggedUsers = abuseProtection.flaggedUsers;
      }
    }

    // Update specific network rules if supplied
    if (networkUpdates && networkUpdates.networkName) {
      const netIndex = admin.networks.findIndex(
        (n: any) =>
          n.networkName.toLowerCase() ===
          networkUpdates.networkName.toLowerCase()
      );
      if (netIndex >= 0) {
        if (typeof networkUpdates.claimAmount === "number") {
          admin.networks[netIndex].claimAmount = networkUpdates.claimAmount;
        }
        if (typeof networkUpdates.claimIntervalHours === "number") {
          admin.networks[netIndex].claimIntervalHours =
            networkUpdates.claimIntervalHours;
        }
        if (typeof networkUpdates.isFaucetActive === "boolean") {
          admin.networks[netIndex].isFaucetActive =
            networkUpdates.isFaucetActive;
        }
      }
    }

    admin.lastUpdated = Date.now();
    await admin.save();

    return res.status(200).json({
      statusCode: 200,
      success: true,
      message: "Admin configuration updated successfully.",
      data: {
        ownerAddress: admin.ownerAddress,
        abuseProtection: admin.abuseProtection,
        networks: admin.networks,
      },
    });
  } catch (error: any) {
    console.error("Error updating admin configuration:", error);
    return res.status(500).json({
      statusCode: 500,
      success: false,
      message: "Internal server error updating admin.",
      error: error.message,
    });
  }
};
