import express from "express";
import { ClaimToken } from "../../user/controller/calimToken";

const router = express.Router();

/**
 * @swagger
 * /api/user/checkStatus:
 *   post:
 *     tags:
 *       - User
 *     summary: user claim token
 *     description: transfert token to user.
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

router.route("/claimToken").post(ClaimToken);

export default router;