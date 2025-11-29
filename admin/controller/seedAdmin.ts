import Admin from "../models/admin";
import { getSolanaBalance, getSepoliaBalance } from "../../config/getBalance";
import { INetworkConfig } from "../../interface/networkConficInterface";

export const seedAdmin = async (
  ownerAddress: string,
  networkData: Partial<INetworkConfig>
) => {
  try {
    // 1. CHECK IF ADMIN EXISTS
    let admin = await Admin.findOne({ ownerAddress });

    // Fetch wallet balance for network admin
    let networkBalance: number | undefined;
    if (!networkData.adminAddress) {
      throw new Error("adminAddress is required to fetch network balance.");
    }

    const networkName = (networkData.networkName || "").toLowerCase();
    if (networkName === "solana") {
      networkBalance = await getSolanaBalance(networkData.adminAddress);
    } else if (networkName === "sepolia") {
      networkBalance = await Number(getSepoliaBalance(networkData.adminAddress));
    } else {
      throw new Error(`Unsupported network: ${networkData.networkName}`);
    }

    // 2. CREATE ADMIN IF NOT FOUND
    if (!admin) {
      admin = new Admin({
        ownerAddress,
        networks: [
          {
            ...networkData,
            latestWalletBalance: Number(networkBalance),
            isFaucetActive: false,
            lastHealthCheck: Date.now(),
            recentTransactions: { transactions: [] },
          },
        ],
        abuseProtection: {
          blockVPNUsers: false,
          blockIncognito: false,
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
      console.log(`Admin CREATED for network: ${networkData.networkName}`);
      return;
    }

    // 3. ADMIN EXISTS → CHECK IF NETWORK EXISTS
    const existingNetwork = admin.networks.find(
      (net: any) => net.networkName === networkData.networkName
    );

    // 4. ADD NEW NETWORK IF NOT EXISTS
    if (!existingNetwork) {
      admin.networks.push({
        ...networkData,
        latestWalletBalance: Number(networkBalance),
        isFaucetActive: false,
        lastHealthCheck: Date.now(),
        recentTransactions: { transactions: [] },
      } as INetworkConfig);
      await admin.save();
      console.log(`New NETWORK ADDED: ${networkData.networkName}`);
    } else {
      console.log(`Network ALREADY EXISTS: ${networkData.networkName}`);
    }
  } catch (error) {
    console.error("Error seeding admin:", error);
  }
};
