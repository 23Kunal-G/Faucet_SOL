import Admin from "../models/admin";

export const seedAdmin = async (ownerAddress: string) => {
  try {
    // Check if admin already exists
    let owner = await Admin.findOne({ ownerAddress });

    if (!owner) {
      // Create admin with base structure
      owner = new Admin({
        ownerAddress,

        // MULTI-NETWORK CONFIG (BEGIN WITH EMPTY ARR)
        networks: [],

        // GLOBAL ANTI-ABUSE CONFIGURATION
        abuseProtection: {
          blockVPNUsers: false,
          blockIncognito: false,
          blockMultipleDevices: false,
          checkIP: true,
          checkUserAgent: true,
          flaggedUsers: [],
        },

        // GLOBAL STATS
        totalUsers: 0,
        totalClaims: 0,

        // GLOBAL SYSTEM LOGS
        recentTransactions: [],

        // SYSTEM META
        lastUpdated: Date.now(),

        // USERS RELATION
        users: [],
      });

      await owner.save();
      console.log(`Admin created: ${ownerAddress}`);
    } else {
      console.log(`Admin already exists: ${ownerAddress}`);
    }
  } catch (error) {
    console.error("Error seeding admin:", error);
  }
};
