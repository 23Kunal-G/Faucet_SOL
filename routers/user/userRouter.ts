import express from "express";
import { registerUser } from "../../user/controller/registerUser";
import { addWallet } from "../../user/controller/addWallet";
import { checkStatus } from "../../user/controller/checkStatus";
import { claimToken } from "../../user/controller/claimToken";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: User
 *   description: Endpoints for user registration, wallet linking, status checks, and token claims.
 */

/**
 * @swagger
 * /api/user/register:
 *   post:
 *     tags: [User]
 *     summary: Register a new user with an email address
 *     description: Creates an account associated with the given email address. Users must register before linking wallets or claiming faucet tokens.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@example.com
 *     responses:
 *       201:
 *         description: User registered successfully.
 *       200:
 *         description: User already registered.
 *       400:
 *         description: Invalid or missing email.
 */
router.post("/register", registerUser);

/**
 * @swagger
 * /api/user/add-wallet:
 *   post:
 *     tags: [User]
 *     summary: Link a wallet address to a registered email for a specific chain
 *     description: Associates a Solana or Sepolia wallet address with the registered user's email. A wallet cannot be linked to multiple emails.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - network
 *               - walletAddress
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@example.com
 *               network:
 *                 type: string
 *                 enum: [solana, sepolia]
 *                 example: solana
 *               walletAddress:
 *                 type: string
 *                 example: 7Np41oeYqPefeNQEHSv1UDhYrehxin3NStELsSKCT4K2
 *     responses:
 *       200:
 *         description: Wallet linked successfully.
 *       400:
 *         description: Invalid wallet address or network.
 *       404:
 *         description: Email not registered.
 *       409:
 *         description: Wallet address already linked to another email.
 */
router.post("/add-wallet", addWallet);

/**
 * @swagger
 * /api/user/status:
 *   get:
 *     tags: [User]
 *     summary: Check claim eligibility and 24h cooldown status
 *     description: Returns whether the user is eligible to claim free tokens on a specific chain, along with remaining cooldown time.
 *     parameters:
 *       - in: query
 *         name: email
 *         schema:
 *           type: string
 *         description: Registered user email
 *         example: user@example.com
 *       - in: query
 *         name: network
 *         schema:
 *           type: string
 *           enum: [solana, sepolia]
 *           default: solana
 *         description: Target blockchain network
 *       - in: query
 *         name: walletAddress
 *         schema:
 *           type: string
 *         description: Optional wallet address to verify match
 *     responses:
 *       200:
 *         description: Status retrieved successfully.
 *       400:
 *         description: Wallet mismatch or missing parameters.
 *       404:
 *         description: User not found.
 */
router.get("/status", checkStatus);
router.get("/checkStatus", checkStatus);
router.post("/checkStatus", checkStatus);

/**
 * @swagger
 * /api/user/claim:
 *   post:
 *     tags: [User]
 *     summary: Claim free tokens on a specific blockchain (Solana / Sepolia)
 *     description: Claims free tokens if email and wallet address match the registration, 24h cooldown has elapsed, and anti-abuse checks pass.
 *     parameters:
 *       - in: header
 *         name: x-is-incognito
 *         schema:
 *           type: string
 *         description: Set to 'true' if detected in private/incognito mode
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - walletAddress
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@example.com
 *               walletAddress:
 *                 type: string
 *                 example: 7Np41oeYqPefeNQEHSv1UDhYrehxin3NStELsSKCT4K2
 *               network:
 *                 type: string
 *                 enum: [solana, sepolia]
 *                 default: solana
 *                 example: solana
 *               isIncognito:
 *                 type: boolean
 *                 default: false
 *     responses:
 *       200:
 *         description: Tokens successfully claimed and transferred!
 *       400:
 *         description: Bad request or validation failure.
 *       403:
 *         description: Anti-abuse violation (Incognito blocked, wallet mismatch, or flagged).
 *       404:
 *         description: User not registered.
 *       429:
 *         description: 24h Cooldown active or IP rate limit reached.
 *       502:
 *         description: Blockchain transaction failed.
 */
router.post("/claim", claimToken);
router.post("/claimToken", claimToken);

export default router;

