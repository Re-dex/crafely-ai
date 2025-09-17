import { Router } from "express";
import { ChatController } from "../controllers/chat.controller";
import { ChatValidator } from "../validator/chat.validator";
import path from "path";
import fs from "fs";
const router = Router();
const chatController = new ChatController();

// Ensure temp upload directory exists
const uploadDir = path.join(process.cwd(), "tmp", "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

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
// New route for creating a presentation
router.post(
  "/completion/parse/presentation",
  ChatValidator.parsePresentation,
  chatController.parsePresentation.bind(chatController)
);
router.post(
  "/completion/image",
  ChatValidator.imageCompletion,
  chatController.imageCompletion.bind(chatController)
);

router.get(
  "/messages",
  ChatValidator.messages,
  chatController.getMessages.bind(chatController)
);

export default router;
