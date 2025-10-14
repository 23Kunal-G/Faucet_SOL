import express from "express";
import { ClaimToken } from "../../user/controller/calimToken";

const router = express.Router();

router.route("/claimToken").post(ClaimToken);

export default router;