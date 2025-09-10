# Architecture Overview

This document provides a comprehensive overview of the Crafely AI Node application architecture, design patterns, and system components.

## 🏗️ System Architecture

The application follows a layered architecture pattern with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Layer                         │
├─────────────────────────────────────────────────────────────┤
│                     API Gateway Layer                       │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │   Web UI    │  │   Mobile    │  │   External   │        │
│  │   (EJS)     │  │    Apps     │  │     APIs     │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
├─────────────────────────────────────────────────────────────┤
│                    Presentation Layer                       │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │ Controllers │  │ Middleware  │  │   Routes     │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
├─────────────────────────────────────────────────────────────┤
│                     Business Layer                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │  Services   │  │   Utils     │  │  Validators │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
├─────────────────────────────────────────────────────────────┤
│                      Data Layer                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │   Prisma    │  │  External   │  │   Redis     │        │
│  │    ORM      │  │    APIs     │  │  (Cache)    │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
├─────────────────────────────────────────────────────────────┤
│                    Infrastructure Layer                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │ PostgreSQL  │  │   OpenAI    │  │  Replicate  │        │
│  │  Database   │  │    API      │  │     API     │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
└─────────────────────────────────────────────────────────────┘
```

## 🔧 Core Components

### 1. Controllers Layer

**Purpose**: Handle HTTP requests and responses, coordinate between routes and services.

**Key Files**:

- `src/controllers/chat.controller.ts` - Chat completion and streaming
- `src/controllers/agent.controller.ts` - Agent management
- `src/controllers/apiKey.controller.ts` - API key management
- `src/controllers/thread.controller.ts` - Thread management

**Responsibilities**:

- Request validation
- Response formatting
- Error handling
- Authentication/authorization

### 2. Services Layer

**Purpose**: Implement business logic and integrate with external services.

**Key Files**:

- `src/services/openai.service.ts` - OpenAI API integration
- `src/services/agent.service.ts` - Agent business logic
- `src/services/chat.service.ts` - Chat functionality
- `src/services/usage.service.ts` - Usage tracking

**Responsibilities**:

- Business logic implementation
- External API integration
- Data transformation
- Caching strategies

### 3. Data Layer

**Purpose**: Manage data persistence and retrieval.

**Key Components**:

- **Prisma ORM**: Database abstraction layer
- **PostgreSQL**: Primary database
- **Redis**: Caching and session storage

**Models**:

- `ApiKey` - API key management
- `Agent` - AI agent configurations
- `Thread` - Conversation threads
- `Package` - Subscription packages
- `Usage` - Token usage tracking

### 4. Middleware Layer

**Purpose**: Handle cross-cutting concerns like authentication, validation, and logging.

**Key Files**:

- `src/middleware/apiKeyToken.middleware.ts` - API key validation
- `src/middleware/jwt.middleware.ts` - JWT authentication
- `src/middleware/validate.middleware.ts` - Request validation

## 🔄 Data Flow

### 1. Request Processing Flow

```
1. Client Request
   ↓
2. Express Router
   ↓
3. Middleware (Auth, Validation)
   ↓
4. Controller
   ↓
5. Service Layer
   ↓
6. Database/External API
   ↓
7. Response Formatter
   ↓
8. Client Response
```

### 2. Chat Completion Flow

```
1. POST /api/v1/chat/completion
   ↓
2. API Key Middleware
   ↓
3. Chat Controller
   ↓
4. Chat Service
   ↓
5. OpenAI Service
   ↓
6. Usage Recording
   ↓
7. Stream Response
```

## 🛡️ Security Architecture

### Authentication Methods

1. **Clerk JWT** - For admin routes and user management
2. **API Keys** - For protected API endpoints

### Security Layers

```
┌─────────────────────────────────────────┐
│            Application Layer            │
├─────────────────────────────────────────┤
│            Middleware Layer             │
│  ┌─────────────┐  ┌─────────────┐     │
│  │   JWT Auth  │  │  API Key    │     │
│  │             │  │  Validation │     │
│  └─────────────┘  └─────────────┘     │
├─────────────────────────────────────────┤
│            Network Layer                │
│  ┌─────────────┐  ┌─────────────┐     │
│  │     CORS    │  │    HTTPS    │     │
│  │             │  │             │     │
│  └─────────────┘  └─────────────┘     │
└─────────────────────────────────────────┘
```

## 📊 Database Architecture

### Entity Relationships

```
User (Clerk)
├── ApiKey (1:N)
│   └── Usage (1:N)
├── Agent (1:N)
│   └── Thread (1:N)
└── UserSubscription (1:N)
    └── Package (N:1)
```

### Key Design Decisions

1. **UUID Primary Keys**: All entities use UUIDs for better security
2. **Soft Deletes**: Important entities use `deletedAt` for soft deletion
3. **Audit Trail**: Created/updated timestamps on all entities
4. **Indexing**: Strategic indexes for performance optimization

## 🔌 External Integrations

### OpenAI Integration

- **Purpose**: Chat completions, embeddings, vision
- **Service**: `OpenAiService`
- **Features**: Streaming, structured output, file uploads

### Replicate Integration

- **Purpose**: Image generation
- **Service**: `ReplicateService`
- **Features**: Multiple model support, async processing

### Clerk Integration

- **Purpose**: User authentication and management
- **Features**: JWT tokens, user sessions, webhooks

## 🚀 Performance Considerations

### Caching Strategy

- **Redis**: Session storage and caching
- **In-Memory**: Service-level caching
- **Database**: Query result caching

### Optimization Techniques

1. **Connection Pooling**: Database connection management
2. **Streaming**: Real-time response streaming
3. **Pagination**: Large dataset handling
4. **Lazy Loading**: On-demand resource loading

## 🔄 Error Handling

### Error Hierarchy

```
BaseError
├── ValidationError
├── AuthenticationError
├── AuthorizationError
├── ServiceError
└── DatabaseError
```

### Error Response Format

```typescript
interface ErrorResponse {
  success: false;
  message: string;
  error: string;
  code?: string;
  details?: any;
}
```

## 📈 Monitoring and Logging

### Logging Levels

- **ERROR**: System errors and exceptions
- **WARN**: Warning conditions
- **INFO**: General information
- **DEBUG**: Detailed debugging information

### Monitoring Points

1. **API Endpoints**: Response times, error rates
2. **Database**: Query performance, connection pool
3. **External APIs**: Response times, rate limits
4. **System**: Memory usage, CPU utilization

## 🔧 Configuration Management

### Environment Variables

```typescript
interface Config {
  database: {
    url: string;
  };
  openai: {
    apiKey: string;
    model: string;
    temperature: number;
  };
  clerk: {
    secretKey: string;
    publishableKey: string;
  };
  server: {
    port: number;
    nodeEnv: string;
  };
}
```

### Configuration Hierarchy

1. **Environment Variables** (highest priority)
2. **Default Values** (fallback)
3. **Validation** (Zod schemas)

## 🚀 Deployment Architecture

### Production Environment

```
┌─────────────────────────────────────────┐
│            Load Balancer                │
├─────────────────────────────────────────┤
│            Application Servers          │
│  ┌─────────────┐  ┌─────────────┐     │
│  │   Server 1  │  │   Server 2  │     │
│  └─────────────┘  └─────────────┘     │
├─────────────────────────────────────────┤
│            Database Cluster             │
│  ┌─────────────┐  ┌─────────────┐     │
│  │   Primary   │  │   Replica   │     │
│  └─────────────┘  └─────────────┘     │
└─────────────────────────────────────────┘
```

### Scaling Considerations

1. **Horizontal Scaling**: Multiple application instances
2. **Database Scaling**: Read replicas, connection pooling
3. **Caching**: Redis cluster for high availability
4. **CDN**: Static asset delivery

## 🔮 Future Architecture Considerations

### Planned Improvements

1. **Microservices**: Break down into smaller services
2. **Event-Driven**: Implement event sourcing
3. **GraphQL**: Add GraphQL API layer
4. **Real-time**: WebSocket support for real-time features

### Technology Upgrades

1. **Node.js**: Keep up with LTS versions
2. **TypeScript**: Adopt latest features
3. **Database**: Consider read replicas
4. **Monitoring**: Implement APM solutions

## 📚 Related Documentation

- [Database Schema](./database.md)
- [Services Documentation](./services.md)
- [API Reference](../api/README.md)
- [Development Guide](../development/README.md)
