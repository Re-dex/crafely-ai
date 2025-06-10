import { Router } from "express";
import { ProductController } from "../controllers/product.controller";

const router = Router();
const productController = new ProductController();

router.post("/generate", productController.generate.bind(productController));
router.post(
  "/generate-image",
  productController.generateImage.bind(productController)
);

router.post(
  "/generate-description",
  productController.generateDescription.bind(productController)
);

export default router;
