import { Router } from "express";
import { WPController } from "../controllers/wp.controller";
const router = Router();
const wpController = new WPController();

router.post("/tags", wpController.generateTags.bind(wpController));
router.post("/alt-text", wpController.generateAltText.bind(wpController));

router.post(
  "/generate-description",
  wpController.generateDescription.bind(wpController)
);
router.post("/test", wpController.tesMethod.bind(wpController));

export default router;
