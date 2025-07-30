import { FreemiusService, FreemiusApiResponse } from "./freemius.service";
import { config } from "../config/env.config";

export interface FreemiusProduct {
  id: number;
  name: string;
  slug: string;
  description?: string;
  price?: number;
  currency?: string;
  // Add more product fields as needed based on the API response
}

export interface FreemiusProductListResponse {
  products: FreemiusProduct[];
  total: number;
  page: number;
  per_page: number;
}

export class FreemiusProductService extends FreemiusService {
  private productId: string;

  constructor() {
    super();
    this.productId = config.freemius.productId;
  }

  /**
   * Get a specific product by ID
   * @param productId - Product ID (optional, uses default from config if not provided)
   * @returns Product information
   */
  async getProduct(
    productId?: string
  ): Promise<FreemiusApiResponse<FreemiusProduct>> {
    const id = productId || this.productId;
    return this.get<FreemiusProduct>(`/products/${id}.json`);
  }

  /**
   * Get all products
   * @param params - Query parameters for pagination, filtering, etc.
   * @returns List of products
   */
  async getProducts(params?: {
    page?: number;
    per_page?: number;
    search?: string;
  }): Promise<FreemiusApiResponse<FreemiusProductListResponse>> {
    return this.get<FreemiusProductListResponse>("/products.json", params);
  }

  /**
   * Create a new product
   * @param productData - Product data to create
   * @returns Created product
   */
  async createProduct(
    productData: Partial<FreemiusProduct>
  ): Promise<FreemiusApiResponse<FreemiusProduct>> {
    return this.post<FreemiusProduct>("/products.json", productData);
  }

  /**
   * Update a product
   * @param productId - Product ID to update
   * @param productData - Updated product data
   * @returns Updated product
   */
  async updateProduct(
    productId: string,
    productData: Partial<FreemiusProduct>
  ): Promise<FreemiusApiResponse<FreemiusProduct>> {
    return this.put<FreemiusProduct>(
      `/products/${productId}.json`,
      productData
    );
  }

  /**
   * Delete a product
   * @param productId - Product ID to delete
   * @returns Deletion result
   */
  async deleteProduct(productId: string): Promise<FreemiusApiResponse<void>> {
    return this.delete<void>(`/products/${productId}.json`);
  }

  /**
   * Get product statistics
   * @param productId - Product ID (optional, uses default from config if not provided)
   * @returns Product statistics
   */
  async getProductStats(productId?: string): Promise<FreemiusApiResponse<any>> {
    const id = productId || this.productId;
    return this.get<any>(`/products/${id}/stats.json`);
  }

  /**
   * Get product licenses
   * @param productId - Product ID (optional, uses default from config if not provided)
   * @param params - Query parameters
   * @returns Product licenses
   */
  async getProductLicenses(
    productId?: string,
    params?: {
      page?: number;
      per_page?: number;
      user_id?: number;
    }
  ): Promise<FreemiusApiResponse<any>> {
    const id = productId || this.productId;
    return this.get<any>(`/products/${id}/licenses.json`, params);
  }

  /**
   * Get the default product ID from config
   */
  getDefaultProductId(): string {
    return this.productId;
  }
}
