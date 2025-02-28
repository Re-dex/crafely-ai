import { Router } from 'express';
import { ChatController } from '../controllers/chat.controller';
import { validateApiKey } from '../middleware/auth.middleware';

const router = Router();
const chatController = new ChatController();

router.post('/completion', validateApiKey, chatController.completion.bind(chatController));
router.post('/stream', validateApiKey, chatController.streamCompletion.bind(chatController));

export default router;