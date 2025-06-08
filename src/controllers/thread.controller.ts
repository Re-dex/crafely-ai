import { Request, Response } from "express";
import { ThreadService } from "../services/thread.service";
import { ApiResponse } from "../types";

export class ThreadController {
  private service: ThreadService;

  constructor() {
    this.service = new ThreadService();
  }

  async create(req: any, res: Response<any>) {
    try {
      const { body, user } = req;
      const response = await this.service.create(body, user);
      res.json({
        success: true,
        data: response,
      });
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
      res.status(500).json(response);
    }
  }
  async list(req: any, res: Response<any>) {
    try {
      const { body, user } = req;
      const response = await this.service.getApiKeys(body, user);
      res.json({
        success: true,
        data: response,
      });
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
      res.status(500).json(response);
    }
  }
}
