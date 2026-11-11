import Admin from "../admin/models/admin";
import { getSepoliaBalance, getSolanaBalance } from "./getBalance";
import { INetworkConfig } from "../interface/networkConficInterface";

export async function setNetwork(ownerAddress: string, networkData: any) {
  let admin = await Admin.findOne({ ownerAddress });

  if (!admin) {
    admin = await Admin.findOne();
  }

  if (admin) {
    const networkName = (networkData.networkName || "").toLowerCase();
    const existingNetworkIndex = admin.networks.findIndex(
      (net: any) => net.networkName.toLowerCase() === networkName
    );

    let networkBalance = 0;
    const adminAddr = networkData.adminAddress || "";

    if (adminAddr) {
      try {
        if (networkName === "solana") {
          networkBalance = await getSolanaBalance(adminAddr);
        } else if (networkName === "sepolia") {
          networkBalance = await getSepoliaBalance(adminAddr);
        }
      } catch (err) {
        console.warn(`Could not check initial balance for ${networkName}:`, err);
      }
    }

    if (existingNetworkIndex === -1) {
      admin.networks.push({
        networkName: networkName as "solana" | "sepolia",

        // Addresses
        adminAddress: adminAddr || "Not Configured",
        faucetWalletAddress:
          networkData.faucetWalletAddress || adminAddr || "Not Configured",
        contractAddress: networkData.contractAddress || "",

        // Claim rules
        claimAmount:
          typeof networkData.claimAmount === "number"
            ? networkData.claimAmount
            : networkName === "solana"
            ? 2
            : 1,
        claimIntervalHours:
          typeof networkData.claimIntervalHours === "number"
            ? networkData.claimIntervalHours
            : 24,
        maxDailyClaims:
          typeof networkData.maxDailyClaims === "number"
            ? networkData.maxDailyClaims
            : 1,

        // Stats
        totalClaims: 0,
        totalUniqueClaimers: 0,
        totalTokensDistributed: 0,

        // Monitoring
        latestWalletBalance: networkBalance,
        isFaucetActive: true,
        lastHealthCheck: Date.now(),
        recentTransactions: { transactions: [] },
      } as unknown as INetworkConfig);

      await admin.save();
      console.log(`✅ Network initialized: ${networkName}`);
    } else {
      // Update balance & health check on startup
      admin.networks[existingNetworkIndex].latestWalletBalance = networkBalance;
      admin.networks[existingNetworkIndex].lastHealthCheck = Date.now();
      if (adminAddr) {
        admin.networks[existingNetworkIndex].adminAddress = adminAddr;
        admin.networks[existingNetworkIndex].faucetWalletAddress =
          networkData.faucetWalletAddress || adminAddr;
      }
      await admin.save();
      console.log(`ℹ️ Network refreshed: ${networkName}`);
    }
  } else {
    console.warn("⚠️ Global Admin does not exist yet. Run seedAdmin first.");
  }
}
