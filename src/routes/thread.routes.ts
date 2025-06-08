import { Router } from "express";
import { ThreadController } from "../controllers/thread.controller";
import { verifyJWT } from "../middleware/jwt.middleware";

const router = Router();
const controller = new ThreadController();

router.post("/create", verifyJWT, controller.create.bind(controller));
router.get("/list", verifyJWT, controller.list.bind(controller));

export default router;
