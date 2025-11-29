import connectRPC from "./connection";
import { Connection , PublicKey } from "@solana/web3.js";

export async function getSepoliaBalance(address: string) {
  try {
    const endpoint = process.env.SEPOLIA_RPC_ENDPOINT || "";
    const provider = await connectRPC(endpoint);
    const balance = await provider.getBalance(address);
    console.log(`Balance in wei: ${balance}`);
    return balance;
  } catch (error) {
    console.log(`Error in getting balance : ${error}`);
  }
}

export async function getSolanaBalance(address: string) {
  try {
    const connection = new Connection(process.env.SOLANA_RPC_ENDPOINT || "");

    const publicKey = new PublicKey(address);

    const balance = await connection.getBalance(publicKey);
    console.log(`Balance in lamports: ${balance}`);
    console.log(`Balance in SOL:${balance / 1e9} SOL`);
    return balance;
  } catch (error) {
    console.log(`Error in getting balance : ${error}`);
  }
}


