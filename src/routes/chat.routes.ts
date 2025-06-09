import { Router } from "express";
import { ChatController } from "../controllers/chat.controller";
const router = Router();
const chatController = new ChatController();

router.post("/completion", chatController.completion.bind(chatController));
router.get("/messages", chatController.getMessages.bind(chatController));

export default router;
