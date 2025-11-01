import getBalance from "../../config/getBalance";
import Admin from "../models/admin";

export const seedAdmin = async (adminAddress: string) => {
  try {
    //check if admin exist or not
    let admin = await Admin.findOne({ adminAddress: adminAddress });

    // Fetch admin wallet balance
    let balance = getBalance(adminAddress);
    if (!admin) {
      admin = new Admin({
        adminAddress: adminAddress,

        faucetTokenAddress: "",
        claimAmount: 0,
        claimIntervalHours: 0,
        maxDailyClaims: 0,
        totalUsers: 0,
        totalClaims: 0,
        totalTokensDistributed: 0,
        totalActiveUsers: 0,
        latestWalletBalance: balance,
        faucetWalletAddress: adminAddress,
        recentTransactions: [],

        lastUpdated: Date.now(),
        systemHealth: {
          faucetOnline: false,
          lastPayoutCheck: Date.now(),
          errorLogs: [],
        },
      });

      await admin.save();
      console.log(`Admin created : ${adminAddress}`);
    }
  } catch (error) {}
};
