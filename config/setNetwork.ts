import Admin from "../admin/models/admin";
import { getSepoliaBalance, getSolanaBalance } from "./getBalance";
import { INetworkConfig } from "../interface/networkConficInterface";

export async function setNetwork(ownerAddress: string, networkData: any) {
  // Global Admin exist  or not
  let admin = await Admin.findOne({ ownerAddress });

  if (admin) {
    const existingNetwork = admin.networks.find(
      (net: any) => net.networkName === networkData.networkName
    );

    let networkBalance: number | undefined;
    if (!networkData.adminAddress) {
      throw new Error("adminAddress is required to fetch network balance.");
    }

    const networkName = (networkData.networkName || "").toLowerCase();
    if (networkName === "solana") {
      networkBalance = await getSolanaBalance(networkData.adminAddress);
      console.log(networkBalance);
    } else if (networkName === "sepolia") {
      networkBalance = Number(await getSepoliaBalance(networkData.adminAddress));
      console.log(networkBalance);
    } else {
      throw new Error(`Unsupported network: ${networkData.networkName}`);
    }

    if (!existingNetwork) {
      admin.networks.push({
        networkName: (networkData.networkName || "").toLowerCase(),

        // Addresses
        adminAddress: networkData.adminAddress,
        faucetWalletAddress: networkData.faucetWalletAddress || networkData.adminAddress,
        contractAddress: networkData.contractAddress || "",

        // Claim rules
        claimAmount: typeof networkData.claimAmount === "number" ? networkData.claimAmount : 1,
        claimIntervalHours: typeof networkData.claimIntervalHours === "number" ? networkData.claimIntervalHours : 24,
        maxDailyClaims: typeof networkData.maxDailyClaims === "number" ? networkData.maxDailyClaims : 1,

        // Stats
        totalClaims: 0,
        totalUniqueClaimers: 0,
        totalTokensDistributed: 0,

        // Monitoring
        latestWalletBalance: typeof networkBalance === "bigint" ? Number(networkBalance) : (typeof networkBalance === "number" ? networkBalance : 0),
        isFaucetActive: false,
        lastHealthCheck: Date.now(),
        recentTransactions: { transactions: [] },
      } as unknown as INetworkConfig);
      await admin.save();
      console.log(`New NETWORK ADDED: ${(networkData.networkName || "").toLowerCase()}`);
    } else {
      console.log(`Network ALREADY EXISTS: ${networkData.networkName}`);
    }
  } else {
    throw new Error("Global Admin does not exist.");
  }
}
