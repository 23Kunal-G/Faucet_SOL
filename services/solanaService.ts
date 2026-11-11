import {
  Connection,
  PublicKey,
  Keypair,
  Transaction,
  SystemProgram,
  sendAndConfirmTransaction,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";

export class SolanaService {
  private static getConnection(): Connection {
    const rpcUrl =
      process.env.SOLANA_RPC_ENDPOINT || "https://api.devnet.solana.com";
    return new Connection(rpcUrl, "confirmed");
  }

  /**
   * Validates whether a given string is a valid Solana public key (on ed25519 curve).
   */
  public static isValidAddress(address: string): boolean {
    try {
      const pubkey = new PublicKey(address);
      return PublicKey.isOnCurve(pubkey.toBytes());
    } catch {
      return false;
    }
  }

  /**
   * Fetches the current balance of a Solana address in SOL.
   */
  public static async getBalance(address: string): Promise<number> {
    const connection = this.getConnection();
    const pubkey = new PublicKey(address);
    const lamports = await connection.getBalance(pubkey);
    return lamports / LAMPORTS_PER_SOL;
  }

  /**
   * Parses faucet private key from environment variables.
   * Supports JSON-stringified byte array format: "[1,2,3,...]".
   */
  private static getFaucetKeypair(): Keypair | null {
    const privateKeyRaw = process.env.SOLANA_FAUCET_PRIVATE_KEY;
    if (!privateKeyRaw || privateKeyRaw.trim() === "") {
      return null;
    }

    try {
      const trimmed = privateKeyRaw.trim();
      if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
        const secretKey = Uint8Array.from(JSON.parse(trimmed));
        return Keypair.fromSecretKey(secretKey);
      }
      return null;
    } catch (err) {
      console.error("Failed to parse SOLANA_FAUCET_PRIVATE_KEY:", err);
      return null;
    }
  }

  /**
   * Dispenses native SOL tokens to the recipient wallet.
   * Uses hot wallet if SOLANA_FAUCET_PRIVATE_KEY is set; otherwise falls back
   * to devnet airdrop request for seamless development testing.
   */
  public static async dispenseSOL(
    recipientAddress: string,
    amountSOL: number
  ): Promise<{ txHash: string; explorerUrl: string }> {
    if (!this.isValidAddress(recipientAddress)) {
      throw new Error(`Invalid Solana recipient address: ${recipientAddress}`);
    }

    const connection = this.getConnection();
    const recipientPubkey = new PublicKey(recipientAddress);
    const lamportsToSend = Math.round(amountSOL * LAMPORTS_PER_SOL);
    const faucetKeypair = this.getFaucetKeypair();

    if (faucetKeypair) {
      // Hot Wallet Mode
      const faucetBalanceLamports = await connection.getBalance(
        faucetKeypair.publicKey
      );

      // Reserve ~0.00005 SOL for transaction fees
      const estimatedFeeLamports = 5000;
      if (faucetBalanceLamports < lamportsToSend + estimatedFeeLamports) {
        throw new Error(
          `Faucet wallet has insufficient SOL balance. Balance: ${
            faucetBalanceLamports / LAMPORTS_PER_SOL
          } SOL, Required: ${
            (lamportsToSend + estimatedFeeLamports) / LAMPORTS_PER_SOL
          } SOL`
        );
      }

      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: faucetKeypair.publicKey,
          toPubkey: recipientPubkey,
          lamports: lamportsToSend,
        })
      );

      const signature = await sendAndConfirmTransaction(
        connection,
        transaction,
        [faucetKeypair],
        { commitment: "confirmed" }
      );

      const explorerUrl = `https://explorer.solana.com/tx/${signature}?cluster=devnet`;
      return { txHash: signature, explorerUrl };
    } else {
      // Fallback: Devnet airdrop request
      console.log(
        `SOLANA_FAUCET_PRIVATE_KEY not configured. Requesting devnet airdrop of ${amountSOL} SOL...`
      );
      const airdropSignature = await connection.requestAirdrop(
        recipientPubkey,
        lamportsToSend
      );

      const latestBlockHash = await connection.getLatestBlockhash();
      await connection.confirmTransaction({
        blockhash: latestBlockHash.blockhash,
        lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
        signature: airdropSignature,
      });

      const explorerUrl = `https://explorer.solana.com/tx/${airdropSignature}?cluster=devnet`;
      return { txHash: airdropSignature, explorerUrl };
    }
  }
}

