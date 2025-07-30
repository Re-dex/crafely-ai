import { config } from "../config/env.config";

export interface FreemiusApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  status?: number;
}

export interface FreemiusRequestOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  headers?: Record<string, string>;
  body?: any;
  params?: Record<string, string | number>;
}

export class FreemiusService {
  private baseUrl: string;
  private apiKey: string;
  private defaultHeaders: Record<string, string>;

  constructor() {
    this.baseUrl = config.freemius.baseUrl;
    this.apiKey = config.freemius.apiKey;
    this.defaultHeaders = {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${this.apiKey}`,
    };
  }

  /**
   * Make a request to the Freemius API
   * @param endpoint - API endpoint (e.g., '/products/19810')
   * @param options - Request options
   * @returns Promise with API response
   */
  async makeRequest<T = any>(
    endpoint: string,
    options: FreemiusRequestOptions = {}
  ): Promise<FreemiusApiResponse<T>> {
    try {
      const { method = "GET", headers = {}, body, params } = options;
      let url = `${this.baseUrl}/products/${config.freemius.productId}${endpoint}`;
      if (params && Object.keys(params).length > 0) {
        const searchParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
          searchParams.append(key, String(value));
        });
        url += `?${searchParams.toString()}`;
      }

      // Prepare headers
      const requestHeaders = {
        ...this.defaultHeaders,
        ...headers,
      };

      // Prepare request options
      const requestOptions: RequestInit = {
        method,
        headers: requestHeaders,
      };

      // Add body for non-GET requests
      if (body && method !== "GET") {
        requestOptions.body = JSON.stringify(body);
      }

      // Make the request
      const response = await fetch(url, requestOptions);

      // Parse response
      const responseData = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error:
            responseData.message ||
            `HTTP ${response.status}: ${response.statusText}`,
          status: response.status,
        };
      }

      return {
        success: true,
        data: responseData,
        status: response.status,
      };
    } catch (error) {
      console.error("Freemius API request failed:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }

  /**
   * GET request helper
   */
  async get<T = any>(
    endpoint: string,
    params?: Record<string, string | number>
  ): Promise<FreemiusApiResponse<T>> {
    return this.makeRequest<T>(endpoint, { method: "GET", params });
  }

  /**
   * POST request helper
   */
  async post<T = any>(
    endpoint: string,
    body?: any,
    params?: Record<string, string | number>
  ): Promise<FreemiusApiResponse<T>> {
    return this.makeRequest<T>(endpoint, { method: "POST", body, params });
  }

  /**
   * PUT request helper
   */
  async put<T = any>(
    endpoint: string,
    body?: any,
    params?: Record<string, string | number>
  ): Promise<FreemiusApiResponse<T>> {
    return this.makeRequest<T>(endpoint, { method: "PUT", body, params });
  }

  /**
   * DELETE request helper
   */
  async delete<T = any>(
    endpoint: string,
    params?: Record<string, string | number>
  ): Promise<FreemiusApiResponse<T>> {
    return this.makeRequest<T>(endpoint, { method: "DELETE", params });
  }

  /**
   * PATCH request helper
   */
  async patch<T = any>(
    endpoint: string,
    body?: any,
    params?: Record<string, string | number>
  ): Promise<FreemiusApiResponse<T>> {
    return this.makeRequest<T>(endpoint, { method: "PATCH", body, params });
  }

  /**
   * Get the current API configuration
   */
  getConfig() {
    return {
      baseUrl: this.baseUrl,
      apiKey: this.apiKey ? `${this.apiKey.substring(0, 8)}...` : "not set",
    };
  }
}
