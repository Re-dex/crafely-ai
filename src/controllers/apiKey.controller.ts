import { Response } from "express";
import { ApiKeyService } from "../services/apiKey.service";
import { BaseController } from "../app/BaseController";
export class ApiKeyController extends BaseController {
  private service: ApiKeyService;

  constructor() {
    super();
    this.service = new ApiKeyService();
  }

  async create(req: any, res: Response<any>) {
    const { body, user } = req;
    const data = await this.service.create(body, user.id);
    await this.handleRequest(req, res, async () =>
      this.handleResponse("Api key created successfully", data, 201)
    );
  }

  async index(req: any, res: Response<any>) {
    const { user } = req;
    const data = await this.service.getApiKeys(user.id);
    await this.handleRequest(req, res, async () =>
      this.handleResponse("Api keys fetched successfully", data)
    );
  }

  async delete(req: any, res: Response<any>) {
    const { params } = req;
    const data = await this.service.deleteApiKeys(params.id);
    await this.handleRequest(req, res, async () =>
      this.handleResponse("Api keys deleted successfully", data)
    );
  }
}
