# Services Documentation

This document provides comprehensive documentation of the service layer in the Crafely AI Node application, including business logic, external integrations, and data processing.

## 🏗️ Service Layer Overview

The service layer implements the business logic of the application and handles external API integrations. It sits between the controllers and the data layer, providing a clean abstraction for complex operations.

## 📁 Service Structure

```
src/services/
├── agent.service.ts           # Agent management
├── apiKey.service.ts          # API key operations
├── chat.service.ts            # Chat functionality
├── freemius.service.ts        # Freemius integration
├── freemius-product.service.ts # Freemius product management
├── memory.service.ts          # Memory management
├── openai.service.ts          # OpenAI API integration
├── package.service.ts         # Package management
├── product.service.ts         # Product operations
├── replicate.service.ts       # Replicate AI integration
├── thread.service.ts          # Thread management
├── tokenPrice.service.ts      # Token pricing
├── usage.service.ts           # Usage tracking
├── usageRecorder.service.ts   # Usage recording
└── user.service.ts            # User operations
```

## 🔧 Core Services

### 1. OpenAiService

**Purpose**: Handles all OpenAI API integrations including chat completions, vision, and file uploads.

**Key Methods**:

- `streamChat()` - Streaming chat completions
- `vision()` - Image analysis and description
- `uploadFile()` - File upload to OpenAI
- `structureOutput()` - Structured output generation

**Example Usage**:

```typescript
const openaiService = new OpenAiService();

// Chat completion
const response = await openaiService.streamChat({
  messages: [{ role: "user", content: "Hello!" }],
  model: "gpt-4",
});

// Image analysis
const visionResult = await openaiService.vision(
  imageUrl,
  "Describe this image"
);

// File upload
const file = await openaiService.uploadFile({
  filePath: "/path/to/file.pdf",
  purpose: "assistants",
});
```

**Configuration**:

```typescript
interface OpenAIConfig {
  apiKey: string;
  model: string;
  temperature: number;
}
```

### 2. ChatService

**Purpose**: Manages chat functionality including message handling, streaming, and completion processing.

**Key Methods**:

- `streamChat()` - Stream chat responses
- `getMessages()` - Retrieve chat messages
- `parseCompletion()` - Parse completion responses
- `parsePresentation()` - Create presentations

**Example Usage**:

```typescript
const chatService = new ChatService();

// Stream chat
await chatService.streamChat(
  {
    message: "Hello, world!",
    sessionId: "session_123",
  },
  response
);

// Get messages
const messages = await chatService.getMessages("session_123");
```

### 3. AgentService

**Purpose**: Manages AI agents including creation, updates, and thread management.

**Key Methods**:

- `create()` - Create new agent
- `findAll()` - Get user's agents
- `findById()` - Get specific agent
- `update()` - Update agent
- `delete()` - Soft delete agent
- `getAgentThreads()` - Get agent's threads
- `createAgentThread()` - Create thread for agent

**Example Usage**:

```typescript
const agentService = new AgentService();

// Create agent
const agent = await agentService.create({
  name: "Customer Support Agent",
  instructions: "Help customers with their questions",
  tools: JSON.stringify(["web_search", "knowledge_base"]),
  userId: "user_123",
});

// Get user's agents
const agents = await agentService.findAll("user_123");
```

### 4. ApiKeyService

**Purpose**: Handles API key management including creation, validation, and usage tracking.

**Key Methods**:

- `create()` - Create new API key
- `findByKeyId()` - Find key by keyId
- `validateKey()` - Validate API key
- `updateLastUsed()` - Update last used timestamp
- `deactivate()` - Deactivate key

**Example Usage**:

```typescript
const apiKeyService = new ApiKeyService();

// Create API key
const apiKey = await apiKeyService.create({
  name: "My API Key",
  permissions: ["chat", "image"],
  userId: "user_123",
});

// Validate key
const isValid = await apiKeyService.validateKey("key_123");
```

### 5. UsageService

**Purpose**: Tracks and manages API usage, token consumption, and cost calculation.

**Key Methods**:

- `recordUsage()` - Record usage data
- `getUsageByUser()` - Get user's usage
- `getUsageByApiKey()` - Get API key usage
- `calculateCost()` - Calculate usage cost
- `getUsageStats()` - Get usage statistics

**Example Usage**:

```typescript
const usageService = new UsageService();

// Record usage
await usageService.recordUsage({
  apiKeyId: "key_123",
  userId: "user_123",
  provider: "openai",
  model: "gpt-4",
  type: "chat",
  tokensIn: 100,
  tokensOut: 50,
  tokensTotal: 150,
  cost: 0.002,
});

// Get usage stats
const stats = await usageService.getUsageStats("user_123", {
  startDate: new Date("2024-01-01"),
  endDate: new Date("2024-01-31"),
});
```

### 6. ThreadService

**Purpose**: Manages conversation threads and session handling.

**Key Methods**:

- `create()` - Create new thread
- `findById()` - Get thread by ID
- `findByUser()` - Get user's threads
- `update()` - Update thread
- `delete()` - Soft delete thread
- `addMessage()` - Add message to thread

**Example Usage**:

```typescript
const threadService = new ThreadService();

// Create thread
const thread = await threadService.create({
  name: "Customer Support Chat",
  userId: "user_123",
  agentId: "agent_123",
});

// Add message
await threadService.addMessage("thread_123", {
  role: "user",
  content: "Hello!",
});
```

## 🔌 External Integrations

### 1. ReplicateService

**Purpose**: Integrates with Replicate AI for image generation and other AI models.

**Key Methods**:

- `generateImage()` - Generate images
- `runModel()` - Run any Replicate model
- `getPrediction()` - Get prediction status
- `cancelPrediction()` - Cancel running prediction

**Example Usage**:

```typescript
const replicateService = new ReplicateService();

// Generate image
const image = await replicateService.generateImage({
  prompt: "A beautiful sunset over mountains",
  model: "stability-ai/stable-diffusion",
});

// Run custom model
const result = await replicateService.runModel({
  model: "replicate/hello-world",
  input: { text: "Hello, Replicate!" },
});
```

### 2. FreemiusService

**Purpose**: Integrates with Freemius for WordPress plugin management and licensing.

**Key Methods**:

- `validateLicense()` - Validate plugin license
- `getUserInfo()` - Get user information
- `updateLicense()` - Update license status
- `getProductInfo()` - Get product information

**Example Usage**:

```typescript
const freemiusService = new FreemiusService();

// Validate license
const license = await freemiusService.validateLicense({
  licenseKey: "license_123",
  productId: "product_456",
});

// Get user info
const userInfo = await freemiusService.getUserInfo("user_123");
```

## 🧠 Memory Management

### MemoryService

**Purpose**: Handles memory storage and retrieval for AI agents and conversations.

**Key Methods**:

- `storeMemory()` - Store memory
- `retrieveMemory()` - Retrieve memory
- `updateMemory()` - Update existing memory
- `deleteMemory()` - Delete memory
- `searchMemories()` - Search memories

**Example Usage**:

```typescript
const memoryService = new MemoryService();

// Store memory
await memoryService.storeMemory({
  userId: "user_123",
  agentId: "agent_123",
  content: "User prefers email communication",
  type: "preference",
});

// Retrieve memories
const memories = await memoryService.retrieveMemory({
  userId: "user_123",
  agentId: "agent_123",
  type: "preference",
});
```

## 📊 Data Processing Services

### 1. TokenPriceService

**Purpose**: Manages token pricing and cost calculations.

**Key Methods**:

- `getTokenPrice()` - Get current token price
- `calculateCost()` - Calculate usage cost
- `updatePricing()` - Update pricing data
- `getPricingHistory()` - Get pricing history

**Example Usage**:

```typescript
const tokenPriceService = new TokenPriceService();

// Get token price
const price = await tokenPriceService.getTokenPrice({
  provider: "openai",
  model: "gpt-4",
});

// Calculate cost
const cost = await tokenPriceService.calculateCost({
  provider: "openai",
  model: "gpt-4",
  tokensIn: 100,
  tokensOut: 50,
});
```

### 2. UsageRecorderService

**Purpose**: Records and processes usage data for billing and analytics.

**Key Methods**:

- `recordFromRequest()` - Record usage from API request
- `recordFromResponse()` - Record usage from API response
- `processUsageBatch()` - Process batch of usage data
- `generateUsageReport()` - Generate usage report

**Example Usage**:

```typescript
const usageRecorder = new UsageRecorderService(usageService);

// Record from request
await usageRecorder.recordFromRequest(request, usageMetadata, {
  model: "gpt-4",
  provider: "openai",
});

// Generate report
const report = await usageRecorder.generateUsageReport({
  userId: "user_123",
  startDate: new Date("2024-01-01"),
  endDate: new Date("2024-01-31"),
});
```

## 🔄 Service Patterns

### 1. Service Factory Pattern

```typescript
class ServiceFactory {
  static createService<T>(serviceClass: new () => T): T {
    return new serviceClass();
  }
}

// Usage
const chatService = ServiceFactory.createService(ChatService);
```

### 2. Service Composition

```typescript
class ChatController {
  private chatService: ChatService;
  private usageService: UsageService;
  private usageRecorder: UsageRecorderService;

  constructor() {
    this.chatService = new ChatService();
    this.usageService = new UsageService();
    this.usageRecorder = new UsageRecorderService(this.usageService);
  }
}
```

### 3. Service Dependencies

```typescript
class ChatService {
  private openaiService: OpenAiService;
  private memoryService: MemoryService;

  constructor() {
    this.openaiService = new OpenAiService();
    this.memoryService = new MemoryService();
  }
}
```

## 🛡️ Error Handling

### Service Error Patterns

```typescript
class ServiceError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500
  ) {
    super(message);
    this.name = 'ServiceError';
  }
}

// Usage in service
async someMethod() {
  try {
    // Service logic
    return result;
  } catch (error) {
    console.error('Service error:', error);
    throw new ServiceError(
      'Operation failed',
      'SERVICE_ERROR',
      500
    );
  }
}
```

## 📈 Performance Optimization

### 1. Caching

```typescript
class CachedService {
  private cache = new Map();

  async getCachedData(key: string, fetcher: () => Promise<any>) {
    if (this.cache.has(key)) {
      return this.cache.get(key);
    }

    const data = await fetcher();
    this.cache.set(key, data);
    return data;
  }
}
```

### 2. Connection Pooling

```typescript
class DatabaseService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient({
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
    });
  }
}
```

### 3. Async Processing

```typescript
class AsyncService {
  async processAsync(data: any) {
    // Process in background
    setImmediate(async () => {
      await this.processData(data);
    });

    return { status: "processing" };
  }
}
```

## 🧪 Testing Services

### Unit Testing

```typescript
describe("ChatService", () => {
  let chatService: ChatService;
  let mockOpenaiService: jest.Mocked<OpenAiService>;

  beforeEach(() => {
    mockOpenaiService = {
      streamChat: jest.fn(),
      getModel: jest.fn(),
    } as any;

    chatService = new ChatService();
    chatService["openaiService"] = mockOpenaiService;
  });

  it("should stream chat successfully", async () => {
    const mockResponse = { message: "Hello!" };
    mockOpenaiService.streamChat.mockResolvedValue(mockResponse);

    const result = await chatService.streamChat(
      {
        message: "Hello!",
        sessionId: "session_123",
      },
      mockResponse
    );

    expect(mockOpenaiService.streamChat).toHaveBeenCalledWith(
      {
        message: "Hello!",
        sessionId: "session_123",
      },
      mockResponse
    );
    expect(result).toEqual(mockResponse);
  });
});
```

### Integration Testing

```typescript
describe("ChatService Integration", () => {
  let chatService: ChatService;

  beforeEach(() => {
    chatService = new ChatService();
  });

  it("should handle real OpenAI API call", async () => {
    const result = await chatService.streamChat(
      {
        message: "Hello!",
        sessionId: "session_123",
      },
      mockResponse
    );

    expect(result).toBeDefined();
    expect(result.message).toContain("Hello");
  });
});
```

## 📚 Service Documentation Standards

### JSDoc Comments

```typescript
/**
 * Service for managing AI agents
 * @class AgentService
 */
export class AgentService {
  /**
   * Creates a new AI agent
   * @param data - Agent creation data
   * @returns Promise<Agent> - The created agent
   * @throws {ServiceError} When agent creation fails
   */
  async create(data: CreateAgentDTO): Promise<Agent> {
    // Implementation
  }
}
```

### Interface Documentation

```typescript
/**
 * Configuration for OpenAI service
 * @interface OpenAIConfig
 */
interface OpenAIConfig {
  /** OpenAI API key */
  apiKey: string;
  /** Model to use for completions */
  model: string;
  /** Temperature for response generation */
  temperature: number;
}
```

## 🔮 Future Enhancements

### Planned Improvements

1. **Service Registry**: Centralized service management
2. **Dependency Injection**: Better service composition
3. **Service Monitoring**: Health checks and metrics
4. **Service Versioning**: API versioning for services

### New Services

1. **NotificationService**: Email and push notifications
2. **AnalyticsService**: Advanced analytics and reporting
3. **CacheService**: Centralized caching layer
4. **QueueService**: Background job processing

## 📚 Related Documentation

- [Architecture Overview](./overview.md)
- [Database Schema](./database.md)
- [API Reference](../api/README.md)
- [Development Guide](../development/README.md)
