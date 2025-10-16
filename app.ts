import express from "express";
import dotenv from "dotenv";
import UserTokenClaimRouter from "./routers/user/claimRoute";
import UserStatusRouter from "./routers/user/checkStatusRoute";
import { connectDB } from "./config/connection";
dotenv.config();

const app = express();
const PORT: number = Number(process.env.PORT) || 5000;
const url: string = process.env.MONGO_URL || "";

// middleware
app.use(express.json());

// routes
app.use("/api/user", UserTokenClaimRouter);
app.use("/api/:claimerAddress", UserStatusRouter);

// database connection
connectDB(url)
  .then(() => console.log("Database connected"))
  .catch((error: Error) => console.error("Database connection failed", error));

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
