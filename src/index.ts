/**
 * Crafely AI Node Application
 *
 * Main entry point for the Crafely AI Node application.
 * This Express.js server provides AI-powered services including chat completions,
 * image generation, agent management, and usage tracking.
 *
 * @author Crafely AI Team
 * @version 1.0.0
 */

import express, { Express } from "express";
import apiRouter from "./routes";
import webRoutes from "./routes/web.routes";
import cors from "cors";
import path from "path";
import { clerkMiddleware } from "@clerk/express";

// Initialize Express application
const app: Express = express();
const port = process.env.PORT || 4000;

// Middleware configuration
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "*",
    credentials: true,
  })
);

// Clerk authentication middleware
app.use(clerkMiddleware());

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// View engine configuration
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Static file serving
app.use(express.static(path.join(__dirname, "../public")));

// Route configuration
app.use("/", webRoutes); // Web routes (landing page, etc.)
app.use("/api", apiRouter); // API routes (v1 endpoints)

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: process.env.npm_package_version || "1.0.0",
  });
});

// Database health check endpoint
app.get("/health/db", async (req, res) => {
  try {
    // Import Prisma client dynamically to avoid circular dependencies
    const { prisma } = await import("./database/prisma");
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({
      status: "healthy",
      database: "connected",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      status: "unhealthy",
      database: "disconnected",
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
    });
  }
});

// 404 handler for unmatched routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    error: "The requested resource does not exist",
    path: req.originalUrl,
    timestamp: new Date().toISOString(),
  });
});

// Global error handler
app.use(
  (
    error: Error,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error("Global error handler:", error);

    res.status(500).json({
      success: false,
      message: "Internal server error",
      error:
        process.env.NODE_ENV === "production"
          ? "Something went wrong"
          : error.message,
      timestamp: new Date().toISOString(),
    });
  }
);

// Start server
app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
  console.log(
    `📊[health]: Health check available at http://localhost:${port}/health`
  );
  console.log(
    `🗄️[database]: Database health check at http://localhost:${port}/health/db`
  );
});

export default app;
