import { Router } from "express";
import { PaymentController } from "../controllers/payment.controller";

const router = Router();
const paymentController = new PaymentController();

router.get("/success", paymentController.redirect.bind(paymentController));

export default router;
