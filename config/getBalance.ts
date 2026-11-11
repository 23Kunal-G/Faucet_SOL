import connectRPC from "./connection";
import { Connection, PublicKey } from "@solana/web3.js";

export async function getSepoliaBalance(address: string): Promise<number> {
  try {
    if (!address || typeof address !== "string" || !address.startsWith("0x")) {
      return 0;
    }
    const endpoint = process.env.SEPOLIA_RPC_ENDPOINT || "";
    if (!endpoint) return 0;

    const provider = await connectRPC(endpoint);
    const balanceWei = await provider.getBalance(address);
    // Convert wei to ether (1 ether = 1e18 wei)
    const balanceEther = Number(balanceWei) / 1e18;
    console.log(`Sepolia Balance: ${balanceEther} ETH`);
    return balanceEther;
  } catch (error) {
    console.warn(`Warning: Could not fetch Sepolia balance for ${address}:`, error);
    return 0;
  }
}

export async function getSolanaBalance(address: string): Promise<number> {
  try {
    if (!address || typeof address !== "string") {
      return 0;
    }
    const rpcUrl =
      process.env.SOLANA_RPC_ENDPOINT || "https://api.devnet.solana.com";
    const connection = new Connection(rpcUrl, "confirmed");

    const publicKey = new PublicKey(address);
    const lamports = await connection.getBalance(publicKey);
    const sol = lamports / 1e9;
    console.log(`Solana Balance: ${sol} SOL (${lamports} lamports)`);
    return sol;
  } catch (error) {
    console.warn(`Warning: Could not fetch Solana balance for ${address}:`, error);
    return 0;
  }
}
