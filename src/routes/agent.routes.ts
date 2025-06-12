import { Router } from "express";
import { AgentController } from "../controllers/agent.controller";
import {
  createAgentValidator,
  updateAgentValidator,
} from "../validator/agent.validator";

const router = Router();
const agentController = new AgentController();

// Agent management routes (admin only)
router.post(
  "/",
  createAgentValidator,
  agentController.create.bind(agentController)
);
router.get("/", agentController.findAll.bind(agentController));
router.get("/:id", agentController.findById.bind(agentController));
router.put(
  "/:id",
  updateAgentValidator,
  agentController.update.bind(agentController)
);
router.delete("/:id", agentController.delete.bind(agentController));

// Thread related routes
router.get(
  "/:id/threads",
  agentController.getAgentThreads.bind(agentController)
);
router.post(
  "/:id/threads",
  agentController.createAgentThread.bind(agentController)
);

export default router;
