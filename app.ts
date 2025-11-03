import express from "express";
import dotenv from "dotenv";
import UserTokenClaimRouter from "./routers/user/claimRoute";
import UserStatusRouter from "./routers/user/checkStatusRoute";
import connectRPC,  {connectDB} from "./config/connection";
import getBalance from "./config/getBalance";
import { error } from "console";
import { seedAdmin } from "./admin/controller/seedAdmin";

dotenv.config();

const app = express();
const PORT: number = Number(process.env.PORT) || 5000;
const url: string = process.env.MONGO_URL || "";
const endpoint: string = process.env.SEPOLIA_RPC_ENDPOINT || "";
const adminAddress: string = process.env.SEED_ADMIN_ADDRESS || "";

// middleware
app.use(express.json());

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
    await seedAdmin(adminAddress);
    console.log("Admin initialized in DB");

    //Start the server
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });

  } catch (error: any) {
    console.error("❌ Error during startup:", error.message);
  }
}

startServer();