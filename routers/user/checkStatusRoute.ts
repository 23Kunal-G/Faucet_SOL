import express from "express";
import { checkStatus } from "../../user/controller/checkStatus";

const router = express.Router();
/**
 * @swagger
 * /api/user/checkStatus:
 *   get:
 *     tags:
 *       - User
 *     summary: Check User Status
 *     description: Fetch the user's token claim status.
 *     parameters:
 *       - in: body
 *         name: claimerAddress
 *         description: Address of the user
 *         schema:
 *           type: object
 *           properties:
 *             claimerAddress:
 *               type: string
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: number
 *                 message:
 *                   type: string
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     remaingTime:
 *                       type: number
 *       400:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */

router.route("/checkStatus").get(checkStatus);

export default router;