import swaggerJsDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import path from "path";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Faucet Colleted Token API",
      version: "1.0.0",
      description: "API Docs for my Node.js project",
    },
  },
  apis: [
    "./routers/user/claimRoute.ts",
    "./routers/user/checkStatusRoute.ts",
  ],
};

const swaggerSpec = swaggerJsDoc(options);

export const swaggerDocs = (app: any, port: number) => {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  console.log(`API Docs available at http://localhost:${port}/api-docs`);
};
