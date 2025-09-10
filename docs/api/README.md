# API Reference

This document provides comprehensive documentation for all API endpoints in the Crafely AI Node application.

## 🔗 Base URL

```
Development: http://localhost:4000
Production: https://your-domain.com
```

## 🔐 Authentication

The API uses two authentication methods:

1. **Clerk JWT** - For admin routes and user management
2. **API Keys** - For protected API endpoints

### API Key Authentication

Include your API key in the request header:

```http
Authorization: Bearer your_api_key_here
```

### Clerk JWT Authentication

Include the JWT token in the request header:

```http
Authorization: Bearer your_jwt_token_here
```

## 📊 Response Format

All API responses follow a consistent format:

### Success Response

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    // Response data
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Error Response

```json
{
  "success": false,
  "message": "Error message",
  "error": "Detailed error information",
  "code": "ERROR_CODE",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## 🚀 API Endpoints

### Public Routes

#### Landing Page

- **GET** `/`
- **Description**: Returns the main landing page
- **Authentication**: None required
- **Response**: HTML page

### Package Management

#### Get All Packages

- **GET** `/api/v1/package`
- **Description**: Retrieve all available packages
- **Authentication**: None required
- **Response**:

```json
{
  "success": true,
  "data": [
    {
      "id": "pkg_123",
      "name": "Basic Plan",
      "description": "Basic package with limited features",
      "price": 9.99,
      "features": ["chat", "image_generation"],
      "interval": "month",
      "active": true
    }
  ]
}
```

#### Get Package by ID

- **GET** `/api/v1/package/:id`
- **Description**: Retrieve a specific package
- **Authentication**: None required
- **Parameters**:
  - `id` (string): Package ID
- **Response**:

```json
{
  "success": true,
  "data": {
    "id": "pkg_123",
    "name": "Basic Plan",
    "description": "Basic package with limited features",
    "price": 9.99,
    "features": ["chat", "image_generation"],
    "interval": "month",
    "active": true
  }
}
```

### Protected Routes (API Key Required)

#### Chat Completions

##### Stream Chat Completion

- **POST** `/api/v1/chat/completion`
- **Description**: Stream chat completion responses
- **Authentication**: API Key required
- **Request Body**:

```json
{
  "message": "Hello, world!",
  "sessionId": "session_123",
  "model": "gpt-4",
  "temperature": 0.7,
  "maxTokens": 1000
}
```

- **Response**: Server-sent events stream

##### Get Chat Messages

- **GET** `/api/v1/chat/messages`
- **Description**: Retrieve chat messages for a session
- **Authentication**: API Key required
- **Query Parameters**:
  - `sessionId` (string): Session ID
- **Response**:

```json
{
  "success": true,
  "data": [
    {
      "id": "msg_123",
      "role": "user",
      "content": "Hello, world!",
      "timestamp": "2024-01-01T00:00:00.000Z"
    },
    {
      "id": "msg_124",
      "role": "assistant",
      "content": "Hello! How can I help you today?",
      "timestamp": "2024-01-01T00:00:01.000Z"
    }
  ]
}
```

##### Parse Completion

- **POST** `/api/v1/chat/parse`
- **Description**: Parse and structure completion responses
- **Authentication**: API Key required
- **Request Body**:

```json
{
  "content": "Raw completion content",
  "format": "json"
}
```

- **Response**:

```json
{
  "success": true,
  "data": {
    "parsed": true,
    "structured": {
      "title": "Parsed Content",
      "content": "Structured content"
    }
  }
}
```

##### Create Presentation

- **POST** `/api/v1/chat/presentation`
- **Description**: Create a presentation from content
- **Authentication**: API Key required
- **Request Body**:

```json
{
  "title": "My Presentation",
  "content": "Presentation content",
  "slides": 5
}
```

- **Response**:

```json
{
  "success": true,
  "data": {
    "presentationId": "pres_123",
    "slides": [
      {
        "title": "Slide 1",
        "content": "Content for slide 1"
      }
    ]
  }
}
```

#### Image Generation

##### Generate Image

- **POST** `/api/v1/chat/image`
- **Description**: Generate images using AI
- **Authentication**: API Key required
- **Request Body**:

```json
{
  "prompt": "A beautiful sunset over mountains",
  "model": "stability-ai/stable-diffusion",
  "width": 512,
  "height": 512
}
```

- **Response**:

```json
{
  "success": true,
  "data": {
    "imageUrl": "https://replicate.com/images/123",
    "model": "stability-ai/stable-diffusion",
    "prompt": "A beautiful sunset over mountains"
  }
}
```

##### Upload File

- **POST** `/api/v1/chat/upload`
- **Description**: Upload files to OpenAI
- **Authentication**: API Key required
- **Request**: Multipart form data
- **Form Fields**:
  - `file` (file): File to upload
  - `purpose` (string): File purpose (fine-tune, assistants, batch)
  - `expiresAfterSeconds` (number): File expiration time
- **Response**:

```json
{
  "success": true,
  "data": {
    "id": "file_123",
    "object": "file",
    "bytes": 1024,
    "created_at": 1640995200,
    "filename": "document.pdf",
    "purpose": "assistants"
  }
}
```

#### Thread Management

##### Create Thread

- **POST** `/api/v1/thread`
- **Description**: Create a new conversation thread
- **Authentication**: API Key required
- **Request Body**:

```json
{
  "name": "My Thread",
  "agentId": "agnt_123",
  "instructions": "Thread instructions"
}
```

- **Response**:

```json
{
  "success": true,
  "data": {
    "id": "thrd_123",
    "name": "My Thread",
    "agentId": "agnt_123",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

##### Get Thread

- **GET** `/api/v1/thread/:id`
- **Description**: Retrieve a specific thread
- **Authentication**: API Key required
- **Parameters**:
  - `id` (string): Thread ID
- **Response**:

```json
{
  "success": true,
  "data": {
    "id": "thrd_123",
    "name": "My Thread",
    "agentId": "agnt_123",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "messages": [
      {
        "id": "msg_123",
        "role": "user",
        "content": "Hello!",
        "timestamp": "2024-01-01T00:00:00.000Z"
      }
    ]
  }
}
```

##### Update Thread

- **PUT** `/api/v1/thread/:id`
- **Description**: Update thread information
- **Authentication**: API Key required
- **Parameters**:
  - `id` (string): Thread ID
- **Request Body**:

```json
{
  "name": "Updated Thread Name",
  "instructions": "Updated instructions"
}
```

- **Response**:

```json
{
  "success": true,
  "data": {
    "id": "thrd_123",
    "name": "Updated Thread Name",
    "instructions": "Updated instructions",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

##### Delete Thread

- **DELETE** `/api/v1/thread/:id`
- **Description**: Soft delete a thread
- **Authentication**: API Key required
- **Parameters**:
  - `id` (string): Thread ID
- **Response**:

```json
{
  "success": true,
  "message": "Thread deleted successfully"
}
```

#### Usage Tracking

##### Get Usage Statistics

- **GET** `/api/v1/usage`
- **Description**: Get usage statistics for the API key
- **Authentication**: API Key required
- **Query Parameters**:
  - `startDate` (string): Start date (ISO 8601)
  - `endDate` (string): End date (ISO 8601)
  - `groupBy` (string): Group by field (day, week, month)
- **Response**:

```json
{
  "success": true,
  "data": {
    "totalTokens": 10000,
    "totalCost": 0.05,
    "usage": [
      {
        "date": "2024-01-01",
        "tokens": 1000,
        "cost": 0.005
      }
    ]
  }
}
```

### Admin Routes (JWT Required)

#### API Key Management

##### Create API Key

- **POST** `/api/v1/admin/api-key`
- **Description**: Create a new API key
- **Authentication**: Clerk JWT required
- **Request Body**:

```json
{
  "name": "My API Key",
  "permissions": ["chat", "image"],
  "expiresAt": "2024-12-31T23:59:59.000Z"
}
```

- **Response**:

```json
{
  "success": true,
  "data": {
    "id": "key_123",
    "keyId": "key_abc123",
    "apiKey": "sk-1234567890abcdef",
    "name": "My API Key",
    "permissions": ["chat", "image"],
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

##### Get API Keys

- **GET** `/api/v1/admin/api-key`
- **Description**: Get all API keys for the user
- **Authentication**: Clerk JWT required
- **Response**:

```json
{
  "success": true,
  "data": [
    {
      "id": "key_123",
      "keyId": "key_abc123",
      "name": "My API Key",
      "permissions": ["chat", "image"],
      "active": true,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "lastUsedAt": "2024-01-01T12:00:00.000Z"
    }
  ]
}
```

##### Update API Key

- **PUT** `/api/v1/admin/api-key/:id`
- **Description**: Update API key information
- **Authentication**: Clerk JWT required
- **Parameters**:
  - `id` (string): API key ID
- **Request Body**:

```json
{
  "name": "Updated API Key Name",
  "permissions": ["chat", "image", "thread"]
}
```

- **Response**:

```json
{
  "success": true,
  "data": {
    "id": "key_123",
    "name": "Updated API Key Name",
    "permissions": ["chat", "image", "thread"],
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

##### Deactivate API Key

- **DELETE** `/api/v1/admin/api-key/:id`
- **Description**: Deactivate an API key
- **Authentication**: Clerk JWT required
- **Parameters**:
  - `id` (string): API key ID
- **Response**:

```json
{
  "success": true,
  "message": "API key deactivated successfully"
}
```

#### Agent Management

##### Create Agent

- **POST** `/api/v1/admin/agent`
- **Description**: Create a new AI agent
- **Authentication**: Clerk JWT required
- **Request Body**:

```json
{
  "name": "Customer Support Agent",
  "instructions": "Help customers with their questions",
  "tools": ["web_search", "knowledge_base"],
  "context": "Customer support knowledge base"
}
```

- **Response**:

```json
{
  "success": true,
  "data": {
    "id": "agnt_123",
    "name": "Customer Support Agent",
    "instructions": "Help customers with their questions",
    "tools": ["web_search", "knowledge_base"],
    "context": "Customer support knowledge base",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

##### Get Agents

- **GET** `/api/v1/admin/agent`
- **Description**: Get all agents for the user
- **Authentication**: Clerk JWT required
- **Response**:

```json
{
  "success": true,
  "data": [
    {
      "id": "agnt_123",
      "name": "Customer Support Agent",
      "instructions": "Help customers with their questions",
      "tools": ["web_search", "knowledge_base"],
      "context": "Customer support knowledge base",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "threads": [
        {
          "id": "thrd_123",
          "name": "Support Thread 1",
          "createdAt": "2024-01-01T00:00:00.000Z"
        }
      ]
    }
  ]
}
```

##### Update Agent

- **PUT** `/api/v1/admin/agent/:id`
- **Description**: Update agent information
- **Authentication**: Clerk JWT required
- **Parameters**:
  - `id` (string): Agent ID
- **Request Body**:

```json
{
  "name": "Updated Agent Name",
  "instructions": "Updated instructions",
  "tools": ["web_search", "knowledge_base", "calculator"]
}
```

- **Response**:

```json
{
  "success": true,
  "data": {
    "id": "agnt_123",
    "name": "Updated Agent Name",
    "instructions": "Updated instructions",
    "tools": ["web_search", "knowledge_base", "calculator"],
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

##### Delete Agent

- **DELETE** `/api/v1/admin/agent/:id`
- **Description**: Soft delete an agent
- **Authentication**: Clerk JWT required
- **Parameters**:
  - `id` (string): Agent ID
- **Response**:

```json
{
  "success": true,
  "message": "Agent deleted successfully"
}
```

#### Usage Analytics

##### Get Usage Analytics

- **GET** `/api/v1/admin/usage`
- **Description**: Get detailed usage analytics
- **Authentication**: Clerk JWT required
- **Query Parameters**:
  - `startDate` (string): Start date (ISO 8601)
  - `endDate` (string): End date (ISO 8601)
  - `groupBy` (string): Group by field (day, week, month)
  - `apiKeyId` (string): Filter by API key
- **Response**:

```json
{
  "success": true,
  "data": {
    "totalTokens": 50000,
    "totalCost": 0.25,
    "totalRequests": 1000,
    "usageByApiKey": [
      {
        "apiKeyId": "key_123",
        "tokens": 25000,
        "cost": 0.125,
        "requests": 500
      }
    ],
    "usageByModel": [
      {
        "model": "gpt-4",
        "tokens": 30000,
        "cost": 0.15,
        "requests": 600
      }
    ],
    "dailyUsage": [
      {
        "date": "2024-01-01",
        "tokens": 1000,
        "cost": 0.005,
        "requests": 20
      }
    ]
  }
}
```

## 🚨 Error Codes

| Code                       | Description                            | HTTP Status |
| -------------------------- | -------------------------------------- | ----------- |
| `INVALID_API_KEY`          | Invalid or missing API key             | 401         |
| `INVALID_JWT`              | Invalid or missing JWT token           | 401         |
| `INSUFFICIENT_PERMISSIONS` | Insufficient permissions for operation | 403         |
| `VALIDATION_ERROR`         | Request validation failed              | 400         |
| `RESOURCE_NOT_FOUND`       | Requested resource not found           | 404         |
| `RATE_LIMIT_EXCEEDED`      | Rate limit exceeded                    | 429         |
| `INTERNAL_ERROR`           | Internal server error                  | 500         |
| `SERVICE_UNAVAILABLE`      | External service unavailable           | 503         |

## 📊 Rate Limits

| Endpoint         | Limit        | Window   |
| ---------------- | ------------ | -------- |
| Chat completions | 100 requests | 1 minute |
| Image generation | 20 requests  | 1 minute |
| File uploads     | 10 requests  | 1 minute |
| Admin operations | 50 requests  | 1 minute |

## 🔧 SDK Examples

### JavaScript/TypeScript

```typescript
class CrafelyAI {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey: string, baseUrl = "https://api.crafely.com") {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
  }

  async chatCompletion(message: string, sessionId: string) {
    const response = await fetch(`${this.baseUrl}/api/v1/chat/completion`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message,
        sessionId,
      }),
    });

    return response.json();
  }

  async generateImage(prompt: string) {
    const response = await fetch(`${this.baseUrl}/api/v1/chat/image`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt }),
    });

    return response.json();
  }
}

// Usage
const client = new CrafelyAI("your_api_key");
const response = await client.chatCompletion("Hello!", "session_123");
```

### Python

```python
import requests
import json

class CrafelyAI:
    def __init__(self, api_key, base_url='https://api.crafely.com'):
        self.api_key = api_key
        self.base_url = base_url
        self.headers = {
            'Authorization': f'Bearer {api_key}',
            'Content-Type': 'application/json'
        }

    def chat_completion(self, message, session_id):
        url = f'{self.base_url}/api/v1/chat/completion'
        data = {
            'message': message,
            'sessionId': session_id
        }
        response = requests.post(url, headers=self.headers, json=data)
        return response.json()

    def generate_image(self, prompt):
        url = f'{self.base_url}/api/v1/chat/image'
        data = {'prompt': prompt}
        response = requests.post(url, headers=self.headers, json=data)
        return response.json()

# Usage
client = CrafelyAI('your_api_key')
response = client.chat_completion('Hello!', 'session_123')
```

## 📚 Related Documentation

- [Architecture Overview](../architecture/overview.md)
- [Database Schema](../architecture/database.md)
- [Services Documentation](../architecture/services.md)
- [Development Guide](../development/README.md)
