import { Router } from "express";
import { ChatController } from "../controllers/chat.controller";
import { validateApiKey } from "../middleware/auth.middleware";

const router = Router();
const chatController = new ChatController();

router.post(
  "/chat",
  validateApiKey,
  chatController.completion.bind(chatController)
);

export default router;
