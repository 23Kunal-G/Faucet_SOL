import express from "express";
import { checkStatus } from "../../user/controller/checkStatus";

const router = express.Router();

router.route("/checkStatus").get(checkStatus).post(checkStatus);
router.route("/status").get(checkStatus);

export default router;
