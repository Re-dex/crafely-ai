import { Response } from "express";
import { ThreadService } from "../services/thread.service";
import { BaseController } from "../app/BaseController";
export class ThreadController extends BaseController {
  private service: ThreadService;

  constructor() {
    super();
    this.service = new ThreadService();
  }

  async create(req: any, res: Response<any>) {
    const { body, user } = req;
    const data = await this.service.create(body, user);
    await this.handleRequest(res, async () =>
      this.handleResponse("Thread created successfully", data, 201)
    );
  }

  async index(req: any, res: Response<any>) {
    const { user } = req;
    const data = await this.service.getThreads(user);
    await this.handleRequest(res, async () =>
      this.handleResponse("Threads fetched successfully", data)
    );
  }

  async delete(req: any, res: Response<any>) {
    const { params } = req;
    const data = await this.service.deleteThread(params.id);
    await this.handleRequest(res, async () =>
      this.handleResponse("Thread deleted successfully", data)
    );
  }
}
