import Admin from "../models/admin";

export const seedAdmin = async (adminAddress: string) => {
  try {
    // Check if admin already exists
    let admin = await Admin.findOne({ adminAddress });

    if (!admin) {
      // Create admin with base structure
      admin = new Admin({
        adminAddress,

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

      await admin.save();
      console.log(`Admin created: ${adminAddress}`);
    } else {
      console.log(`Admin already exists: ${adminAddress}`);
    }
  } catch (error) {
    console.error("Error seeding admin:", error);
  }
};
