import { Router } from "express";
import { PackageController } from "../controllers/package.controller";
import { jwtMiddleware } from "../middleware";

const router = Router();
const packageController = new PackageController();

// Package management routes (admin only)
router.post("/packages", jwtMiddleware, (req, res) =>
  packageController.createPackage(req, res)
);
router.get("/packages", (req, res) => packageController.getPackages(req, res));
router.get("/packages/:id", (req, res) =>
  packageController.getPackage(req, res)
);
router.put("/packages/:id", jwtMiddleware, (req, res) =>
  packageController.updatePackage(req, res)
);
router.delete("/packages/:id", jwtMiddleware, (req, res) =>
  packageController.deletePackage(req, res)
);

// Subscription routes
router.post("/subscriptions", jwtMiddleware, (req, res) =>
  packageController.createSubscription(req, res)
);
router.get("/subscriptions/me", jwtMiddleware, (req, res) =>
  packageController.getUserSubscription(req, res)
);
router.post("/subscriptions/:id/cancel", jwtMiddleware, (req, res) =>
  packageController.cancelSubscription(req, res)
);

export default router;
