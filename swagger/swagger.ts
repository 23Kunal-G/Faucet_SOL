import swaggerJsDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Multi-Chain Faucet API (Solana & Sepolia)",
      version: "1.0.0",
      description:
        "High-performance multi-chain faucet backend with user email registration, wallet verification, 24-hour cooldown enforcement, and anti-abuse / incognito protection.",
    },
    servers: [
      {
        url: "http://localhost:5000",
        description: "Local Development Server",
      },
    ],
  },
  apis: [
    "./routers/user/userRouter.ts",
    "./routers/user/claimRoute.ts",
    "./routers/user/checkStatusRoute.ts",
  ],
};

const swaggerSpec = swaggerJsDoc(options);

export const swaggerDocs = (app: any, port: number) => {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  console.log(`Swagger API documentation available at http://localhost:${port}/api-docs`);
};
