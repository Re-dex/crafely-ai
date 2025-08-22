import { Router } from "express";
import { UsageController } from "../controllers/usage.controller";
import { UsageValidator } from "../validator/usage.validator";

const router = Router();
const controller = new UsageController();

router.post("/", UsageValidator.create, controller.create.bind(controller));
router.get(
  "/me",
  UsageValidator.rangeQuery,
  controller.listByUser.bind(controller)
);
router.get(
  "/me/summary",
  UsageValidator.rangeQuery,
  controller.summarizeByUser.bind(controller)
);

// Scoped to current API key (requires apiKey middleware where mounted)
router.get(
  "/",
  UsageValidator.rangeQuery,
  controller.listByApiKey.bind(controller)
);
router.get(
  "/summary",
  UsageValidator.rangeQuery,
  controller.summarizeByApiKey.bind(controller)
);

router.get("/:id", controller.get.bind(controller));
router.delete("/:id", controller.delete.bind(controller));

export default router;
