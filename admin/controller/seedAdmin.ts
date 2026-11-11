import Admin from "../models/admin";

export const seedAdmin = async (ownerAddress: string) => {
  try {
    const adminAddr = ownerAddress || process.env.SEED_ADMIN_ADDRESS || "0xDefaultFaucetAdmin";
    let admin = await Admin.findOne();

    if (!admin) {
      admin = new Admin({
        ownerAddress: adminAddr,
        networks: [],
        abuseProtection: {
          blockVPNUsers: false,
          blockIncognito: true,
          blockMultipleDevices: false,
          checkIP: true,
          checkUserAgent: true,
          flaggedUsers: [],
        },
        totalUsers: 0,
        totalClaims: 0,
        recentTransactions: [],
        users: [],
        lastUpdated: Date.now(),
      });
      await admin.save();
      console.log(`✅ Default Admin initialized with address: ${adminAddr}`);
    } else {
      console.log(`ℹ️ Admin already exists: ${admin.ownerAddress}`);
    }
  } catch (error) {
    console.error("❌ Error seeding admin:", error);
  }
};
