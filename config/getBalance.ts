import connectRPC from "./connection";

export default async function getBalance(address: string) {
  try {
    const endpoint = process.env.SEPOLIA_RPC_ENDPOINT || "";
    const provider = await connectRPC(endpoint);
    const balance = await provider.getBalance(address);
    return balance;
  } catch (error) {
    console.log(`Error in getting balance : ${error}`);
  }
}
