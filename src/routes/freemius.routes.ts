import { Router } from "express";
import { FreemiusController } from "../controllers/freemius.controller";

const router = Router();
const freemiusController = new FreemiusController();

// Test API connection
router.get("/test", freemiusController.testConnection.bind(freemiusController));

// Product routes
router.get(
  "/products",
  freemiusController.getProducts.bind(freemiusController)
);
router.get(
  "/products/:productId",
  freemiusController.getProduct.bind(freemiusController)
);
router.get(
  "/products/:productId/stats",
  freemiusController.getProductStats.bind(freemiusController)
);
router.get(
  "/products/:productId/licenses",
  freemiusController.getProductLicenses.bind(freemiusController)
);

export default router;
