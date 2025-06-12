import { Request, Response } from "express";
import { AgentService } from "../services/agent.service";
import { BaseController } from "../app/BaseController";
import { CreateAgentDTO, UpdateAgentDTO } from "../types/agent.types";

export class AgentController extends BaseController {
  private agentService: AgentService;

  constructor() {
    super();
    this.agentService = new AgentService();
  }

  async create(req: Request & { user?: any }, res: Response) {
    try {
      if (!req.user) {
        const error = new Error("Unauthorized access");
        Object.assign(error, { code: 401 });
        throw error;
      }

      const data: CreateAgentDTO = {
        ...req.body,
        userId: req.user.id,
      };
      const agent = await this.agentService.create(data);
      return this.success(res, agent);
    } catch (error) {
      return this.error(res, error);
    }
  }

  async findAll(req: Request & { user?: any }, res: Response) {
    try {
      if (!req.user) {
        const error = new Error("Unauthorized access");
        Object.assign(error, { code: 401 });
        throw error;
      }

      const agents = await this.agentService.findAll(req.user.id);

      return this.success(res, agents);
    } catch (error) {
      console.log(error.message);
      return this.error(res, error);
    }
  }

  async findById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const agent = await this.agentService.findById(id);
      if (!agent) {
        return this.notFound(res);
      }
      return this.success(res, agent);
    } catch (error) {
      return this.error(res, error);
    }
  }

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data: UpdateAgentDTO = {
        id,
        ...req.body,
      };
      const agent = await this.agentService.update(data);
      return this.success(res, agent);
    } catch (error) {
      return this.error(res, error);
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const agent = await this.agentService.delete(id);
      return this.success(res, agent);
    } catch (error) {
      return this.error(res, error);
    }
  }

  async getAgentThreads(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const threads = await this.agentService.getAgentThreads(id);
      return this.success(res, threads);
    } catch (error) {
      return this.error(res, error);
    }
  }

  async createAgentThread(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const threadData = req.body;
      const thread = await this.agentService.createAgentThread(id, threadData);
      return this.success(res, thread);
    } catch (error) {
      return this.error(res, error);
    }
  }
}
