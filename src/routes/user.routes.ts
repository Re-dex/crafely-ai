import { Router } from "express";
import { UserController } from "../controllers/user.controller";
import { AuthValidator } from "../validator/auth.validator";
const router = Router();
const controller = new UserController();

router.post(
  "/registration",
  AuthValidator.registration,
  controller.registration.bind(controller)
);
router.post("/login", AuthValidator.login, controller.login.bind(controller));

export default router;
