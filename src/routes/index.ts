import { Router, Request, Response, NextFunction } from "express";
import chatRoutes from "./chat.routes";
import wpRoutes from "./wp.routes";
import productRoute from "./product.routes";
import userRoute from "./user.routes";
import apiKeyRoute from "./apiKey.routes";
import threadRoutes from "./thread.routes";
import { apiKeyMiddleware, jwtMiddleware } from "../middleware";

const apiRouter = Router();
const v1Router = Router();

// Public routes (no middleware)
apiRouter.use("/user", userRoute);

// JWT protected admin routes
const adminRouter = Router();
adminRouter.use(jwtMiddleware);
adminRouter.use("/api-key", apiKeyRoute);

// API key protected routes
const protectedRouter = Router();
protectedRouter.use(apiKeyMiddleware);
protectedRouter.use("/chat", chatRoutes);
protectedRouter.use("/wp", wpRoutes);
protectedRouter.use("/product", productRoute);
protectedRouter.use("/thread", threadRoutes);

// Mount all routes under /v1
v1Router.use("/admin", adminRouter); // /v1/admin/*
v1Router.use("/", protectedRouter); // /v1/*

apiRouter.use("/v1", v1Router);

// Catch-all for undefined routes
apiRouter.use((req: Request, res: Response) => {
  res.status(404).json({ error: "Route not found" });
});

export default apiRouter;
