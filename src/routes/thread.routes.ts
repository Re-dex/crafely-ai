import { Router } from "express";
import { ThreadController } from "../controllers/thread.controller";
import { validateApiKey } from "../middleware/auth.middleware";

const router = Router();
const controller = new ThreadController();

router.post("/create", validateApiKey, controller.create.bind(controller));
router.get("/list", validateApiKey, controller.list.bind(controller));

export default router;
