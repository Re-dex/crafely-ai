import { Router, Request, Response, ErrorRequestHandler } from "express";
import chatRoutes from "./chat.routes";
import wpRoutes from "./wp.routes";
import productRoute from "./product.routes";
import apiKeyRoute from "./apiKey.routes";
import threadRoutes from "./thread.routes";
import packageRoutes from "./package.routes";
import agentRoutes from "./agent.routes";
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
// adminRouter.use(extendedRequireAuth);
adminRouter.use("/api-key", apiKeyRoute);
adminRouter.use("/package", packageRoutes); // Add package management routes
adminRouter.use("/agent", agentRoutes); // Add agent management
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

// Clerk Unauthorized error handler
// const clerkUnauthorizedHandler: ErrorRequestHandler = (err, req, res, next) => {
//   if (err && err.status === 401) {
//     return res.status(401).json({
//       success: false,
//       message: "Unauthorized",
//       error: "Authentication required",
//     });
//   }
//   next(err);
// };

// apiRouter.use(clerkUnauthorizedHandler);

export default apiRouter;
