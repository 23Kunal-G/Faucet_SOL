import express from "express";
import { claimToken } from "../../user/controller/claimToken";

const router = express.Router();

router.route("/claimToken").post(claimToken);
router.route("/claim").post(claimToken);

export default router;
