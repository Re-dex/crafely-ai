import { Router } from "express";
import { ProductController } from "../controllers/product.controller";
import { ProductValidator } from "../validator/product.validator";
const router = Router();
const productController = new ProductController();

router.post(
  "/generate",
  ProductValidator.generate,
  productController.generate.bind(productController)
);
router.post(
  "/generate-image",
  ProductValidator.generateImage,
  productController.generateImage.bind(productController)
);

router.post(
  "/generate-description",
  ProductValidator.generateDescription,
  productController.generateDescription.bind(productController)
);

export default router;
