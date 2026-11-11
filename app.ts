import express, { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import userRouter from "./routers/user/userRouter";
import connectRPC, { connectDB } from "./config/connection";
import { setNetwork } from "./config/setNetwork";
import { seedAdmin } from "./admin/controller/seedAdmin";
import { swaggerDocs } from "./swagger/swagger";

dotenv.config();

const app = express();
const PORT: number = Number(process.env.PORT) || 5000;
const mongoUrl: string = process.env.MONGO_URL || "mongodb://127.0.0.1:27017/faucet_db";
const sepoliaEndpoint: string = process.env.SEPOLIA_RPC_ENDPOINT || "";
const adminAddress: string = process.env.SEED_ADMIN_ADDRESS || "0xDefaultFaucetAdmin";

// Multi-network configurations
const networksData = [
  {
    networkName: "solana",
    chainId: 103,
    adminAddress: process.env.SOLANA_ADMIN_ADDRESS || "Not Configured",
    faucetWalletAddress: process.env.SOLANA_ADMIN_ADDRESS || "Not Configured",
    contractAddress: process.env.SOLANA_CONTRACT_ADDRESS || "",
    rpcUrl: process.env.SOLANA_RPC_ENDPOINT || "https://api.devnet.solana.com",
    claimAmount: 2,
    claimIntervalHours: 24,
    maxDailyClaims: 2,
  },
  {
    networkName: "sepolia",
    chainId: 11155111,
    adminAddress: process.env.SEPOLIA_ADMIN_ADDRESS || "Not Configured",
    faucetWalletAddress: process.env.SEPOLIA_ADMIN_ADDRESS || "Not Configured",
    contractAddress: process.env.SEPOLIA_CONTRACT_ADDRESS || "",
    rpcUrl: sepoliaEndpoint,
    claimAmount: 1,
    claimIntervalHours: 24,
    maxDailyClaims: 1,
  },
];

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Enable CORS for frontend applications (hosted in separate repos)
app.use((req: Request, res: Response, next: NextFunction) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization, x-is-incognito, x-client-fingerprint"
  );
  if (req.method === "OPTIONS") {
    res.sendStatus(200);
    return;
  }
  next();
});

// Swagger Documentation
swaggerDocs(app, PORT);

// Health check endpoint
app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// User API Routes
app.use("/api/user", userRouter);

// Global Error Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error("Unhandled Server Error:", err);
  res.status(500).json({
    statusCode: 500,
    success: false,
    message: "Internal server error occurred.",
    error: err.message,
  });
});

async function startServer() {
  try {
    // 1. Connect to MongoDB
    console.log("Connecting to MongoDB...");
    await connectDB(mongoUrl);
    console.log("✅ Database connected successfully");

    // 2. Connect RPC (Sepolia if configured)
    if (sepoliaEndpoint) {
      try {
        await connectRPC(sepoliaEndpoint);
        console.log("✅ Sepolia RPC connected");
      } catch (rpcErr) {
        console.warn("⚠️ Sepolia RPC connection skipped or failed:", rpcErr);
      }
    } else {
      console.log("ℹ️ Sepolia RPC endpoint not configured in .env. Skipping RPC check.");
    }

    // 3. Initialize Admin
    await seedAdmin(adminAddress);

    // 4. Initialize Network configurations
    for (const network of networksData) {
      await setNetwork(adminAddress, network);
    }

    // 5. Start Server
    app.listen(PORT, () => {
      console.log(`🚀 Faucet Server is running at http://localhost:${PORT}`);
      console.log(`📖 API Docs available at http://localhost:${PORT}/api-docs`);
    });
  } catch (error: any) {
    console.error("❌ Fatal Error during server startup:", error.message);
  }
}

startServer();
