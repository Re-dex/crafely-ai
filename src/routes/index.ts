import { Router, Request, Response } from "express";
import chatRoutes from "./chat.routes";
import productRoute from "./product.routes";
import fileRoutes from "./file.routes";
import apiKeyRoute from "./apiKey.routes";
import threadRoutes from "./thread.routes";
import packageRoutes from "./package.routes";
import agentRoutes from "./agent.routes";
import usageRoutes from "./usage.routes";

import { requireAuth, getAuth } from "@clerk/express";

import { apiKeyMiddleware } from "../middleware";
const apiRouter = Router();
const v1Router = Router();

const extendedRequireAuth = [
  requireAuth(),
  (req: any, _res: any, next: any) => {
    const { userId } = getAuth(req);
    req.user = { id: userId };
    next();
  },
];

/**
 * Admin Routes - Protected with JWT middleware
 */
const adminRouter = Router();
adminRouter.use(extendedRequireAuth);
adminRouter.use("/api-key", apiKeyRoute);
adminRouter.use("/agent", agentRoutes); // Add agent management
adminRouter.use("/usage", usageRoutes);
v1Router.use("/admin", adminRouter); // /v1/admin/*

/**
 * Protected Routes - Require valid API key
 */
v1Router.use("/chat", apiKeyMiddleware, chatRoutes);
v1Router.use("/product", apiKeyMiddleware, productRoute);
v1Router.use("/file", apiKeyMiddleware, fileRoutes);
v1Router.use("/thread", apiKeyMiddleware, threadRoutes);
v1Router.use("/usage", apiKeyMiddleware, usageRoutes);

v1Router.use("/package", packageRoutes); // Add package management routes

// Mount /v1 routes
apiRouter.use("/v1", v1Router);

/**
 * 404 Handler for unmatched /v1 routes
 */
v1Router.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    error: "API route does not match existing patterns",
  });
});

export default apiRouter;
