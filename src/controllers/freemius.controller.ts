import { Request, Response } from "express";
import { FreemiusProductService } from "../services/freemius-product.service";
import { FreemiusService } from "../services/freemius.service";

export class FreemiusController {
  private freemiusService: FreemiusService;
  private productService: FreemiusProductService;

  constructor() {
    this.freemiusService = new FreemiusService();
    this.productService = new FreemiusProductService();
  }

  /**
   * Get product information
   */
  async getProduct(req: Request, res: Response) {
    try {
      const { productId } = req.params;
      const result = await this.productService.getProduct(productId);

      if (!result.success) {
        return res.status(400).json({
          success: false,
          message: result.error,
        });
      }

      return res.json({
        success: true,
        data: result.data,
      });
    } catch (error) {
      console.error("Error fetching product:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  /**
   * Get all products
   */
  async getProducts(req: Request, res: Response) {
    try {
      const { page, per_page, search } = req.query;
      const params: any = {};

      if (page) params.page = parseInt(page as string);
      if (per_page) params.per_page = parseInt(per_page as string);
      if (search) params.search = search as string;

      const result = await this.productService.getProducts(params);

      if (!result.success) {
        return res.status(400).json({
          success: false,
          message: result.error,
        });
      }

      return res.json({
        success: true,
        data: result.data,
      });
    } catch (error) {
      console.error("Error fetching products:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  /**
   * Get product statistics
   */
  async getProductStats(req: Request, res: Response) {
    try {
      const { productId } = req.params;
      const result = await this.productService.getProductStats(productId);

      if (!result.success) {
        return res.status(400).json({
          success: false,
          message: result.error,
        });
      }

      return res.json({
        success: true,
        data: result.data,
      });
    } catch (error) {
      console.error("Error fetching product stats:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  /**
   * Get product licenses
   */
  async getProductLicenses(req: Request, res: Response) {
    try {
      const { productId } = req.params;
      const { page, per_page, user_id } = req.query;
      const params: any = {};

      if (page) params.page = parseInt(page as string);
      if (per_page) params.per_page = parseInt(per_page as string);
      if (user_id) params.user_id = parseInt(user_id as string);

      const result = await this.productService.getProductLicenses(
        productId,
        params
      );

      if (!result.success) {
        return res.status(400).json({
          success: false,
          message: result.error,
        });
      }

      return res.json({
        success: true,
        data: result.data,
      });
    } catch (error) {
      console.error("Error fetching product licenses:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  /**
   * Test API connection
   */
  async testConnection(req: Request, res: Response) {
    try {
      const config = this.freemiusService.getConfig();
      const result = await this.productService.getProduct();

      return res.json({
        success: true,
        config,
        connection: result.success ? "Connected" : "Failed",
        error: result.error,
      });
    } catch (error) {
      console.error("Error testing connection:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
}
