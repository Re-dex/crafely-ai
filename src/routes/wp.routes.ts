import { Router } from "express";
import { WPController } from "../controllers/wp.controller";
import { validateApiKey } from "../middleware/auth.middleware";

const router = Router();
const wpController = new WPController();

router.post(
  "/tags",
  validateApiKey,
  wpController.generateTags.bind(wpController)
);
router.post(
  "/alt-text",
  validateApiKey,
  wpController.generateAltText.bind(wpController)
);

router.post(
  "/generate-description",
  validateApiKey,
  wpController.generateDescription.bind(wpController)
);
router.post("/test", validateApiKey, wpController.tesMethod.bind(wpController));

export default router;
