import { Request, Response } from "express";
import { ProductService } from "../services/product.service";
import { ApiResponse } from "../types";

export class ProductController {
  private productService: ProductService;

  constructor() {
    this.productService = new ProductService();
  }

  async conversation(req: Request, res: Response<any>) {
    try {
      const request: any = req.body;
      await this.productService.conversation(request, res);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
      res.status(500).json(response);
    }
  }

  async generate(req: Request, res: Response<any>) {
    try {
      const request: any = req.body;
      const { product } = await this.productService.generate(request);
      res.json({
        success: true,
        data: product,
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
