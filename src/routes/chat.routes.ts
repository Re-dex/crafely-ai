import { Router } from "express";
import { ChatController } from "../controllers/chat.controller";
import { ChatValidator } from "../validator/chat.validator";
const router = Router();
const chatController = new ChatController();

router.post(
  "/completion",
  ChatValidator.completion,
  chatController.completion.bind(chatController)
);
router.post(
  "/completion/parse",
  ChatValidator.parseCompletion,
  chatController.parseCompletion.bind(chatController)
);
router.get(
  "/messages",
  ChatValidator.messages,
  chatController.getMessages.bind(chatController)
);

export default router;
