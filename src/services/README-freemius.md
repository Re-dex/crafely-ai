# Freemius API Services

This directory contains services for communicating with the Freemius API for payment and product management.

## Services Overview

### 1. FreemiusService (Base Service)

The base service that handles all HTTP communication with the Freemius API.

**Location:** `src/services/freemius.service.ts`

**Features:**

- Handles authentication with Bearer token
- Provides generic HTTP methods (GET, POST, PUT, DELETE, PATCH)
- Built-in error handling and response formatting
- Query parameter support
- TypeScript support with generics

**Key Methods:**

- `makeRequest<T>(endpoint, options)` - Generic request method
- `get<T>(endpoint, params)` - GET request helper
- `post<T>(endpoint, body, params)` - POST request helper
- `put<T>(endpoint, body, params)` - PUT request helper
- `delete<T>(endpoint, params)` - DELETE request helper
- `patch<T>(endpoint, body, params)` - PATCH request helper

### 2. FreemiusProductService (Specialized Service)

Extends the base service with product-specific operations.

**Location:** `src/services/freemius-product.service.ts`

**Features:**

- Product-specific API endpoints
- Pre-configured with default product ID from config
- Type-safe interfaces for product data
- Methods for common product operations

**Key Methods:**

- `getProduct(productId?)` - Get product information
- `getProducts(params?)` - Get all products with pagination
- `createProduct(productData)` - Create new product
- `updateProduct(productId, productData)` - Update existing product
- `deleteProduct(productId)` - Delete product
- `getProductStats(productId?)` - Get product statistics
- `getProductLicenses(productId, params?)` - Get product licenses

## Configuration

Add the following environment variables to your `.env` file:

```env
FREEMIUS_BASE_URL=https://api.freemius.com/v1
FREEMIUS_API_KEY=458b3725a75fce22cb41eecdc162b5f6
FREEMIUS_PRODUCT_ID=19810
```

## Usage Examples

### Basic Usage

```typescript
import { FreemiusService } from "./services/freemius.service";
import { FreemiusProductService } from "./services/freemius-product.service";

// Using base service
const freemiusService = new FreemiusService();
const result = await freemiusService.get("/products/19810.json");

// Using product service
const productService = new FreemiusProductService();
const product = await productService.getProduct();
```

### API Endpoints

The services are accessible via the following API endpoints:

- `GET /v1/freemius/test` - Test API connection
- `GET /v1/freemius/products` - Get all products
- `GET /v1/freemius/products/:productId` - Get specific product
- `GET /v1/freemius/products/:productId/stats` - Get product statistics
- `GET /v1/freemius/products/:productId/licenses` - Get product licenses

### Response Format

All API responses follow this format:

```typescript
interface FreemiusApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  status?: number;
}
```

### Error Handling

The services include comprehensive error handling:

```typescript
const result = await productService.getProduct();

if (result.success) {
  console.log("Product:", result.data);
} else {
  console.error("Error:", result.error);
  console.log("Status:", result.status);
}
```

## Extending the Services

### Creating a New Specialized Service

```typescript
import { FreemiusService, FreemiusApiResponse } from "./freemius.service";

export class FreemiusUserService extends FreemiusService {
  async getUsers(params?: { page?: number; per_page?: number }) {
    return this.get("/users.json", params);
  }

  async getUser(userId: string) {
    return this.get(`/users/${userId}.json`);
  }

  async createUser(userData: any) {
    return this.post("/users.json", userData);
  }
}
```

### Custom API Calls

```typescript
const freemiusService = new FreemiusService();

// Custom request with parameters
const result = await freemiusService.makeRequest("/custom-endpoint.json", {
  method: "POST",
  body: { key: "value" },
  params: { page: 1, per_page: 10 },
  headers: { "Custom-Header": "value" },
});
```

## Testing

Run the example usage to test the services:

```typescript
import { FreemiusUsageExample } from "./examples/freemius-usage";

const example = new FreemiusUsageExample();
await example.runAllExamples();
```

## Notes

- All services use TypeScript for type safety
- Error handling is built into all methods
- The base service can be extended for any Freemius API endpoint
- Configuration is centralized in `src/config/env.config.ts`
- Services follow the existing project patterns and conventions
