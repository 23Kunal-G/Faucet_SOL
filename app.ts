import express from "express";
import dotenv from "dotenv";
import UserTokenClaimRouter from "./routers/user/claimRoute";
import UserStatusRouter from "./routers/user/checkStatusRoute";
import connectRPC,  {connectDB} from "./config/connection";
import getBalance from "./config/getBalance";
import { seedAdmin } from "./admin/controller/seedAdmin";
import { swaggerDocs } from "./swagger/swagger";

dotenv.config();

const app = express();
const PORT: number = Number(process.env.PORT) || 5000;
const url: string = process.env.MONGO_URL || "";
const endpoint: string = process.env.SEPOLIA_RPC_ENDPOINT || "";
const adminAddress: string = process.env.SEED_ADMIN_ADDRESS || "";

// Define networkData or import it from the appropriate module
const networksData = [
  {
    networkName: "Sepolia",
    chainId: 11155111,
    adminAddress: process.env.SEPOLIA_ADMIN_ADDRESS,   // Must exist in .env
    rpcUrl: process.env.SEPOLIA_RPC_ENDPOINT,
  },
  {
    networkName: "Solana",
    chainId: 103,
    adminAddress: process.env.SOLANA_ADMIN_ADDRESS,    // Must exist in .env
    rpcUrl: process.env.SOLANA_RPC_ENDPOINT,
  },
];

// middleware
app.use(express.json());

swaggerDocs(app, PORT);

// routes
app.use("/api/user", UserTokenClaimRouter , UserStatusRouter);

async function startServer() {
  try {
    //Connect to MongoDB
    await connectDB(url);
    console.log("Database connected");

    //Connect RPC
    await connectRPC(endpoint);
    console.log("RPC connected");

    //Fetch Admin balance
    const balance = await getBalance(adminAddress);
    console.log(`Admin wallet balance fetched: ${balance}`);

    //Initialize Admin
    const ownerAdminAddress = adminAddress;

    // Initialize Admin for all networks
    for (const network of networksData) {
      console.log(`Initializing Network: ${network.networkName}`);
      await seedAdmin(ownerAdminAddress, network);
    }

    //Start the server
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });

  } catch (error: any) {
    console.error("❌ Error during startup:", error.message);
  }
}

startServer();