# Multi-Chain Faucet (Solana & Sepolia) — Backend Engine

A secure, high-performance backend platform allowing users to claim free faucet tokens across multiple blockchain networks (starting with **Solana**, followed by **Sepolia**).

---

## 🚀 Key Features & Flow

1. **User Registration via Email**:
   - Every user first registers with their email address (`POST /api/user/register`).
2. **Chain-Specific Wallet Association**:
   - The user links a wallet address for a specific blockchain (`POST /api/user/add-wallet`).
   - A single email can link distinct wallets for `solana` and `sepolia`.
   - Wallets cannot be registered by multiple conflicting emails (preventing sybil hijacking).
3. **Strict Email & Wallet Match Verification**:
   - When claiming on a network (`POST /api/user/claim`), the user must provide both `email` and `walletAddress`.
   - The server verifies that the provided wallet address strictly matches the registered wallet for that email on that chain.
4. **24-Hour Cooldown Enforcement**:
   - Enforced per **Email Account** on each chain.
   - Enforced per **Wallet Address** across the entire database (preventing users from creating new emails to reuse the same wallet).
   - Cooldown and remaining time can be checked at any time via `GET /api/user/status`.
5. **Anti-Abuse & Security Restrictions**:
   - **Incognito / Private Browsing Detection**: Client sends detection header (`x-is-incognito: true`) or flag; server blocks claims originating from private windows if policy is enabled.
   - **IP Rate Limiting**: Restricts rapid multi-wallet claims originating from the same IP address within 24 hours.
   - **User-Agent Validation**: Rejects empty user-agents or direct automated bot scrapers.
   - **Admin Blacklist / Flagging**: Dynamically blocks flagged addresses, emails, or IPs.
6. **Real Solana Dispenser**:
   - Validates Solana addresses using `ed25519` curve validation (`@solana/web3.js`).
   - Transfers native SOL from configured hot wallet (`SOLANA_FAUCET_PRIVATE_KEY`) or devnet airdrop fallback.
   - Returns on-chain transaction hash (`txHash`) and Solana Explorer link.

---

## 🛠️ API Reference

All user endpoints are mounted under `/api/user`.

### 1. Register User
- **Method**: `POST`
- **Path**: `/api/user/register`
- **Body**:
  ```json
  {
    "email": "user@example.com"
  }
  ```

### 2. Link Wallet to Chain
- **Method**: `POST`
- **Path**: `/api/user/add-wallet`
- **Body**:
  ```json
  {
    "email": "user@example.com",
    "network": "solana",
    "walletAddress": "7Np41oeYqPefeNQEHSv1UDhYrehxin3NStELsSKCT4K2"
  }
  ```

### 3. Check Eligibility & 24h Cooldown Status
- **Method**: `GET`
- **Path**: `/api/user/status?email=user@example.com&network=solana`
- **Response**:
  ```json
  {
    "statusCode": 200,
    "success": true,
    "message": "You are eligible to claim tokens.",
    "data": {
      "canClaim": true,
      "email": "user@example.com",
      "network": "solana",
      "registeredWallet": "7Np41oeYqPefeNQEHSv1UDhYrehxin3NStELsSKCT4K2",
      "remainingTimeMs": 0,
      "remainingFormatted": "Ready to claim"
    }
  }
  ```

### 4. Claim Faucet Tokens
- **Method**: `POST`
- **Path**: `/api/user/claim`
- **Headers**:
  - `Content-Type`: `application/json`
  - `x-is-incognito`: `false` *(or `true` if client detects private browsing)*
- **Body**:
  ```json
  {
    "email": "user@example.com",
    "network": "solana",
    "walletAddress": "7Np41oeYqPefeNQEHSv1UDhYrehxin3NStELsSKCT4K2",
    "isIncognito": false
  }
  ```
- **Response (Success)**:
  ```json
  {
    "statusCode": 200,
    "success": true,
    "message": "Successfully claimed 2 SOLANA tokens!",
    "data": {
      "email": "user@example.com",
      "network": "solana",
      "walletAddress": "7Np41oeYqPefeNQEHSv1UDhYrehxin3NStELsSKCT4K2",
      "amount": 2,
      "txHash": "5K...signature",
      "explorerUrl": "https://explorer.solana.com/tx/5K.../?cluster=devnet",
      "nextClaimTime": 1731456789000,
      "cooldownRemaining": "24h 0m 0s"
    }
  }
  ```

---

## 🛡️ Frontend Integration Guide (Separate Repo)

When calling this API from your separate frontend repository:
1. **CORS is Pre-configured**: The server allows cross-origin requests and custom anti-abuse headers (`x-is-incognito`, `x-client-fingerprint`).
2. **Client-side Incognito Detection**:
   In your frontend client, run a storage quota test (e.g., `navigator.storage.estimate()`) and attach either:
   - Header: `x-is-incognito: true`
   - Body field: `"isIncognito": true`
3. **Interactive Swagger Docs**:
   Start the server and visit `http://localhost:5000/api-docs` to test all endpoints interactively.
