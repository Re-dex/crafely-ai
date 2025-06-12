import { Router, Request, Response } from "express";
import chatRoutes from "./chat.routes";
import wpRoutes from "./wp.routes";
import productRoute from "./product.routes";
import userRoute from "./user.routes";
import apiKeyRoute from "./apiKey.routes";
import threadRoutes from "./thread.routes";
import packageRoutes from "./package.routes";
import { apiKeyMiddleware, jwtMiddleware } from "../middleware";

const apiRouter = Router();
const v1Router = Router();

/**
 * Public Routes - No authentication required
 */
v1Router.use("/user", userRoute);

/**
 * Admin Routes - Protected with JWT middleware
 */
const adminRouter = Router();
adminRouter.use(jwtMiddleware);
adminRouter.use("/api-key", apiKeyRoute);
adminRouter.use("/package", packageRoutes); // Add package management routes
v1Router.use("/admin", adminRouter); // /v1/admin/*

/**
 * Protected Routes - Require valid API key
 */
v1Router.use("/chat", apiKeyMiddleware, chatRoutes);
v1Router.use("/wp", apiKeyMiddleware, wpRoutes);
v1Router.use("/product", apiKeyMiddleware, productRoute);
v1Router.use("/thread", apiKeyMiddleware, threadRoutes);

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

// Mount /v1 routes
apiRouter.use("/v1", v1Router);

/**
 * Global 404 Handler for non-/v1 routes
 */
apiRouter.use((req: Request, res: Response) => {
  res.status(404).json({ error: "Route not found" });
});

export default apiRouter;
