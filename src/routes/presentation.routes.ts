import { Router } from "express";
import { PresentationController } from "../controllers/presentation.controller";
import { ChatValidator } from "../validator/chat.validator";

const router = Router();
const presentationController = new PresentationController();

// 1. presentation/completion => General completion for presentation context
router.post(
  "/slide/content",
  ChatValidator.slideContent,
  presentationController.completion.bind(presentationController)
);

// 2. presentation/create => Create a complete presentation
router.post(
  "/create",
  ChatValidator.parsePresentation,
  presentationController.createPresentation.bind(presentationController)
);

// 3. presentation/slide/create => Create individual slides
router.post(
  "/slide/create",
  ChatValidator.parseCompletion,
  presentationController.createSlide.bind(presentationController)
);

// 4. presentation/slide/visual => Generate visual content for slides
router.post(
  "/slide/visual",
  ChatValidator.imageCompletion,
  presentationController.generateSlideVisual.bind(presentationController)
);

// 5. presentation/chat => Chat functionality for presentation context
router.post(
  "/chat",
  ChatValidator.completion,
  presentationController.chat.bind(presentationController)
);

// 6. presentation/messages => Get presentation-related messages
router.get(
  "/messages",
  ChatValidator.messages,
  presentationController.getMessages.bind(presentationController)
);

export default router;
