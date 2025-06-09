import { Request, Response } from "express";
import { ApiKeyService } from "../services/apiKey.service";
import { ApiResponse } from "../types";
import { BaseController } from "../app/BaseController";
export class ApiKeyController extends BaseController {
  private service: ApiKeyService;

  constructor() {
    super();
    this.service = new ApiKeyService();
  }

  async create(req: any, res: Response<any>) {
    await this.handleRequest(res, async () => {
      const { body, user } = req;
      return {
        code: 201,
        message: "Api key created successfully",
        data: await this.service.create(body, user),
      };
    });
  }
  async index(req: any, res: Response<any>) {
    await this.handleRequest(res, async () => {
      const { body, user } = req;
      return {
        message: "Api keys fetched successfully",
        data: await this.service.getApiKeys(body, user),
      };
    });
  }

  async delete(req: any, res: Response<any>) {
    await this.handleRequest(res, async () => {
      const { params } = req;
      return {
        message: "Api keys deleted successfully",
        data: await this.service.deleteApiKeys(params.id),
      };
    });
  }
}
