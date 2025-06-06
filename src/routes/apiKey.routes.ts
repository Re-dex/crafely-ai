import { Router } from "express";
import { ApiKeyController } from "../controllers/apiKey.controller";
import { verifyJWT } from "../middleware/jwt.middleware";

const router = Router();
const controller = new ApiKeyController();

router.post("/create", verifyJWT, controller.create.bind(controller));
router.get("/list", verifyJWT, controller.list.bind(controller));

export default router;
