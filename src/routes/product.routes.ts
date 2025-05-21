import { Router } from "express";
import { ProductController } from "../controllers/product.controller";
import { validateApiKey } from "../middleware/auth.middleware";

const router = Router();
const productController = new ProductController();

router.post(
  "/conversation",
  validateApiKey,
  productController.conversation.bind(productController)
);

router.post(
  "/generate",
  validateApiKey,
  productController.generate.bind(productController)
);
router.post(
  "/generate-image",
  validateApiKey,
  productController.generateImage.bind(productController)
);

export default router;
