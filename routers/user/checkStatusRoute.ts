import express from "express";
import { checkStatus } from "../../user/controller/checkStatus";

const router = express.Router();
/**
 * @Swagger
 */

router.route("/checkStatus").get(checkStatus);

export default router;