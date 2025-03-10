import { Router } from "express";
import { TagsController } from "../controllers/tags.controller";
import { validateApiKey } from "../middleware/auth.middleware";

const router = Router();
const tagsController = new TagsController();

router.post(
  "/tags",
  validateApiKey,
  tagsController.generateTags.bind(tagsController)
);
router.post(
  "/alt-text",
  validateApiKey,
  tagsController.generateAltText.bind(tagsController)
);

export default router;
