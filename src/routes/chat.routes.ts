import { Router } from "express";
import { ChatController } from "../controllers/chat.controller";
import { validateApiKey } from "../middleware/auth.middleware";

const router = Router();
const chatController = new ChatController();

router.post(
  "/completion",
  validateApiKey,
  chatController.completion.bind(chatController)
);
router.get(
  "/messages",
  validateApiKey,
  chatController.getMessages.bind(chatController)
);

export default router;
