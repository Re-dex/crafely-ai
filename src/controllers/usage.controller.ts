import { Request, Response } from "express";
import { BaseController } from "../app/BaseController";
import { UsageService } from "../services/usage.service";

export class UsageController extends BaseController {
  private service: UsageService;
  constructor() {
    super();
    this.service = new UsageService();
  }

  async create(req: any, res: Response) {
    const { apiKey, user, body } = req;
    const payload = {
      apiKeyId: apiKey.id,
      userId: user.id,
      provider: body.provider,
      model: body.model,
      type: body.type,
      tokensIn: body.tokensIn,
      tokensOut: body.tokensOut,
      tokensTotal: body.tokensTotal,
      cost: body.cost,
      currency: body.currency,
      metadata: body.metadata,
    };
    await this.handleRequest(req, res, async () =>
      this.handleResponse(
        "Usage created",
        await this.service.create(payload),
        201
      )
    );
  }

  async listByApiKey(req: any, res: Response) {
    const { apiKey } = req;
    await this.handleRequest(req, res, async () =>
      this.handleResponse(
        "Usages fetched",
        await this.service.listByApiKey(apiKey.id, req.query)
      )
    );
  }

  async listByUser(req: any, res: Response) {
    await this.handleRequest(req, res, async () =>
      this.handleResponse(
        "Usages fetched",
        await this.service.listByUser(req.user.id, req.query)
      )
    );
  }

  async summarizeByApiKey(req: any, res: Response) {
    const { apiKey } = req;
    await this.handleRequest(req, res, async () =>
      this.handleResponse(
        "Usage summary",
        await this.service.summarizeByApiKey(apiKey.id, req.query)
      )
    );
  }

  async summarizeByUser(req: any, res: Response) {
    await this.handleRequest(req, res, async () =>
      this.handleResponse(
        "Usage summary",
        await this.service.summarizeByUser(req.user.id, req.query)
      )
    );
  }

  async get(req: Request, res: Response) {
    await this.handleRequest(req, res, async () =>
      this.handleResponse(
        "Usage fetched",
        await this.service.get(req.params.id)
      )
    );
  }

  async delete(req: Request, res: Response) {
    await this.handleRequest(req, res, async () =>
      this.handleResponse(
        "Usage deleted",
        await this.service.delete(req.params.id)
      )
    );
  }
}
