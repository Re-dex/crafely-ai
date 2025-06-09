import { Router } from "express";
import { ApiKeyController } from "../controllers/apiKey.controller";

const router = Router();
const controller = new ApiKeyController();

router.get("/", controller.index.bind(controller));
router.post("/", controller.create.bind(controller));
router.delete("/:id", controller.delete.bind(controller));

export default router;
