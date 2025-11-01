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

// middleware
app.use(express.json());

// routes
app.use("/api/user", UserTokenClaimRouter , UserStatusRouter);

// database connection
connectDB(url)
  .then(() => console.log("Database connected"))
  .catch((error: Error) => console.error("Database connection failed", error));

// conncect RPC
connectRPC(endpoint)
  .then(() => console.log("RPC connected"))
  .catch((error: Error) => console.error("RPC connection failed", error));

// Get Admin wallet balance
getBalance(process.env.SEED_ADMIN_ADDRESS || "")
  .then((balance: any) => console.log(`Admin wallet balance fetched: ${balance}`))
  .catch((error: Error) => console.error("Admin wallet balance fetch failed", error));

// Initialize Admin in DB
seedAdmin(process.env.SEED_ADMIN_ADDRESS || "");
console.log("Admin initializes");


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
