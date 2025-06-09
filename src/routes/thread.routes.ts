import { Router } from "express";
import { ThreadController } from "../controllers/thread.controller";

const router = Router();
const controller = new ThreadController();

router.post("/create", controller.create.bind(controller));
router.get("/list", controller.list.bind(controller));

export default router;
