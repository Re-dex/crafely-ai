import { FreemiusService } from "../services/freemius.service";
import { FreemiusProductService } from "../services/freemius-product.service";

/**
 * Example usage of Freemius services
 */
export class FreemiusUsageExample {
  private freemiusService: FreemiusService;
  private productService: FreemiusProductService;

  constructor() {
    this.freemiusService = new FreemiusService();
    this.productService = new FreemiusProductService();
  }

  /**
   * Example: Get product information using the base service
   */
  async getProductWithBaseService() {
    console.log("=== Using Base Freemius Service ===");

    // Using the base service directly
    const result = await this.freemiusService.get("/products/19810.json");

    if (result.success) {
      console.log("Product data:", result.data);
    } else {
      console.error("Error:", result.error);
    }
  }

  /**
   * Example: Get product information using the product service
   */
  async getProductWithProductService() {
    console.log("=== Using Product Service ===");

    // Using the specialized product service
    const result = await this.productService.getProduct();

    if (result.success) {
      console.log("Product data:", result.data);
    } else {
      console.error("Error:", result.error);
    }
  }

  /**
   * Example: Get all products with pagination
   */
  async getAllProducts() {
    console.log("=== Getting All Products ===");

    const result = await this.productService.getProducts({
      page: 1,
      per_page: 10,
    });

    if (result.success) {
      console.log("Products:", result.data);
    } else {
      console.error("Error:", result.error);
    }
  }

  /**
   * Example: Get product statistics
   */
  async getProductStats() {
    console.log("=== Getting Product Statistics ===");

    const result = await this.productService.getProductStats();

    if (result.success) {
      console.log("Product stats:", result.data);
    } else {
      console.error("Error:", result.error);
    }
  }

  /**
   * Example: Custom API call using the base service
   */
  async customApiCall() {
    console.log("=== Custom API Call ===");

    // Example of a custom API call using the base service
    const result = await this.freemiusService.makeRequest("/users.json", {
      method: "GET",
      params: {
        page: 1,
        per_page: 5,
      },
    });

    if (result.success) {
      console.log("Custom API response:", result.data);
    } else {
      console.error("Error:", result.error);
    }
  }

  /**
   * Example: Test API connection
   */
  async testConnection() {
    console.log("=== Testing API Connection ===");

    const config = this.freemiusService.getConfig();
    console.log("API Config:", config);

    const result = await this.productService.getProduct();
    console.log(
      "Connection test result:",
      result.success ? "Connected" : "Failed"
    );

    if (!result.success) {
      console.error("Connection error:", result.error);
    }
  }

  /**
   * Run all examples
   */
  async runAllExamples() {
    try {
      await this.testConnection();
      console.log("\n");

      await this.getProductWithBaseService();
      console.log("\n");

      await this.getProductWithProductService();
      console.log("\n");

      await this.getAllProducts();
      console.log("\n");

      await this.getProductStats();
      console.log("\n");

      await this.customApiCall();
    } catch (error) {
      console.error("Error running examples:", error);
    }
  }
}

// Usage example:
// const example = new FreemiusUsageExample();
// example.runAllExamples();
