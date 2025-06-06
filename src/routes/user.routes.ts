import { Router } from "express";
import { UserController } from "../controllers/user.controller";
import { validateApiKey } from "../middleware/auth.middleware";

const router = Router();
const userController = new UserController();

router.post(
  "/registration",
  validateApiKey,
  userController.registration.bind(userController)
);
router.post(
  "/login",
  validateApiKey,
  userController.login.bind(userController)
);

export default router;
