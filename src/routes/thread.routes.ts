import { Router } from "express";
import { ThreadController } from "../controllers/thread.controller";

const router = Router();
const controller = new ThreadController();

router.post("/", controller.create.bind(controller));
router.get("/", controller.index.bind(controller));
router.delete("/:id", controller.delete.bind(controller));

export default router;
