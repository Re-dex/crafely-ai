import { Router } from "express";
import { PackageController } from "../controllers/package.controller";

const router = Router();
const packageController = new PackageController();

// Package management routes (admin only)
router.post("/", (req, res) => packageController.createPackage(req, res));
router.get("/", (req, res) => packageController.getPackages(req, res));
router.get("/:id", (req, res) => packageController.getPackage(req, res));
router.put("/:id", (req, res) => packageController.updatePackage(req, res));
router.delete("/:id", (req, res) => packageController.deletePackage(req, res));

// Subscription routes
router.post("/subscription", (req, res) =>
  packageController.createSubscription(req, res)
);
router.get("/subscription/me", (req, res) =>
  packageController.getUserSubscription(req, res)
);
router.post("/subscription/:id/cancel", (req, res) =>
  packageController.cancelSubscription(req, res)
);

export default router;
