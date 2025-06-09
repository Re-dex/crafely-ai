import { Request, Response } from "express";
import { ApiKeyService } from "../services/apiKey.service";
import { ApiResponse } from "../types";

export class ApiKeyController {
  private service: ApiKeyService;

  constructor() {
    this.service = new ApiKeyService();
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
  async index(req: any, res: Response<any>) {
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

  async delete(req: any, res: Response<any>) {
    try {
      const { params, user } = req;
      const response = await this.service.deleteApiKeys(params.id);
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
