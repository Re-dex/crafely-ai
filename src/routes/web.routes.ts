import { Router, Request, Response } from "express";
import paymentRoutes from "./payment.routes";
const router = Router();

router.get("/", (req: Request, res: Response) => {
  res.render("index", {
    title: "Crafely AI",
  });
});

router.use("/payment", paymentRoutes);

export default router;
