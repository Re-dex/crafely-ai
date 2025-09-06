import { Router } from "express";
import { ChatController } from "../controllers/chat.controller";
import { ChatValidator } from "../validator/chat.validator";
import multer from "multer";
import path from "path";
import fs from "fs";
const router = Router();
const chatController = new ChatController();

// Ensure temp upload directory exists
const uploadDir = path.join(process.cwd(), "tmp", "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    cb(null, file.originalname);
  },
});
const upload = multer({ storage });

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
router.post(
  "/completion/file",
  upload.single("file"),
  chatController.uploadFile.bind(chatController)
);
router.get(
  "/messages",
  ChatValidator.messages,
  chatController.getMessages.bind(chatController)
);

export default router;
