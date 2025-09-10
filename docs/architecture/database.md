# Database Schema Documentation

This document provides comprehensive documentation of the database schema, relationships, and data models used in the Crafely AI Node application.

## 🗄️ Database Overview

The application uses **PostgreSQL** as the primary database with **Prisma ORM** for database abstraction and type safety.

### Database Configuration

```typescript
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
  output   = "../src/generated/prisma"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

## 📊 Entity Models

### 1. ApiKey Model

**Purpose**: Manages API keys for authentication and usage tracking.

```prisma
model ApiKey {
  id          String    @id @default(dbgenerated("concat('key_', gen_random_uuid())")) @db.VarChar(255)
  keyId       String    @unique
  hashedKey   String
  name        String?
  prefix      String?
  permissions String[]
  active      Boolean   @default(true)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  lastUsedAt  DateTime?

  userId      String
  usages      Usage[]

  @@index([userId, active])
  @@index([keyId])
}
```

**Fields**:

- `id`: Unique identifier with `key_` prefix
- `keyId`: Public key identifier for API requests
- `hashedKey`: Securely hashed API key
- `name`: Human-readable name for the key
- `prefix`: Key prefix for identification
- `permissions`: Array of permissions granted to the key
- `active`: Whether the key is currently active
- `userId`: Foreign key to Clerk user ID
- `usages`: One-to-many relationship with Usage model

**Indexes**:

- `[userId, active]`: Optimizes queries for user's active keys
- `[keyId]`: Optimizes key lookup during authentication

### 2. Agent Model

**Purpose**: Stores AI agent configurations and instructions.

```prisma
model Agent {
  id            String    @id @default(dbgenerated("concat('agnt_', gen_random_uuid())")) @db.VarChar(255)
  name          String
  instructions  String
  tools         String?    // JSON stringified array of tools
  context       String?   // Optional context/knowledge base
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  deletedAt     DateTime?

  userId        String    // Foreign key for Clerk User ID
  threads       Thread[]  // One agent can have many threads

  @@index([userId])
  @@index([name])
}
```

**Fields**:

- `id`: Unique identifier with `agnt_` prefix
- `name`: Agent name
- `instructions`: System instructions for the agent
- `tools`: JSON string of available tools
- `context`: Additional context or knowledge base
- `userId`: Foreign key to Clerk user ID
- `threads`: One-to-many relationship with Thread model

**Indexes**:

- `[userId]`: Optimizes queries for user's agents
- `[name]`: Optimizes agent name searches

### 3. Thread Model

**Purpose**: Manages conversation threads and sessions.

```prisma
model Thread {
  id            String    @id @default(dbgenerated("concat('thrd_', gen_random_uuid())")) @db.VarChar(255)
  name          String
  storageId     String?   @unique
  instructions  String?
  model         String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  deletedAt     DateTime?

  userId        String
  agentId       String?
  agent         Agent?    @relation(fields: [agentId], references: [id])

  @@index([userId])
  @@index([agentId])
}
```

**Fields**:

- `id`: Unique identifier with `thrd_` prefix
- `name`: Thread name
- `storageId`: External storage identifier
- `instructions`: Thread-specific instructions
- `model`: AI model used for the thread
- `userId`: Foreign key to Clerk user ID
- `agentId`: Optional foreign key to Agent model
- `agent`: Optional relationship to Agent model

**Indexes**:

- `[userId]`: Optimizes queries for user's threads
- `[agentId]`: Optimizes queries for agent's threads

### 4. Package Model

**Purpose**: Defines subscription packages and pricing.

```prisma
model Package {
  id          String    @id @default(dbgenerated("concat('pkg_', gen_random_uuid())")) @db.VarChar(255)
  name        String    @unique
  description String?
  price       Float
  features    String[]
  interval    String    @default("month") // month or year
  active      Boolean   @default(true)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  subscriptions UserSubscription[]
}
```

**Fields**:

- `id`: Unique identifier with `pkg_` prefix
- `name`: Package name (unique)
- `description`: Package description
- `price`: Package price
- `features`: Array of package features
- `interval`: Billing interval (month/year)
- `active`: Whether the package is available
- `subscriptions`: One-to-many relationship with UserSubscription

### 5. UserSubscription Model

**Purpose**: Tracks user subscriptions to packages.

```prisma
model UserSubscription {
  id            String    @id @default(dbgenerated("concat('sub_', gen_random_uuid())")) @db.VarChar(255)
  status        String    @default("active") // active, cancelled, expired
  startDate     DateTime  @default(now())
  endDate       DateTime?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  userId        String
  packageId     String
  package       Package   @relation(fields: [packageId], references: [id])

  @@index([userId])
  @@index([packageId])
}
```

**Fields**:

- `id`: Unique identifier with `sub_` prefix
- `status`: Subscription status
- `startDate`: Subscription start date
- `endDate`: Subscription end date
- `userId`: Foreign key to Clerk user ID
- `packageId`: Foreign key to Package model
- `package`: Relationship to Package model

**Indexes**:

- `[userId]`: Optimizes queries for user's subscriptions
- `[packageId]`: Optimizes queries for package subscriptions

### 6. Usage Model

**Purpose**: Tracks API usage and token consumption.

```prisma
model Usage {
  id           String    @id @default(dbgenerated("concat('use_', gen_random_uuid())")) @db.VarChar(255)
  createdAt    DateTime  @default(now())

  // Links
  apiKeyId     String
  apiKey       ApiKey    @relation(fields: [apiKeyId], references: [id])
  userId       String

  // What was used
  provider     String?
  model        String?
  type         String?   // chat, image, embeddings, etc.

  // Token and cost info
  tokensIn     Int?
  tokensOut    Int?
  tokensTotal  Int?
  cost         Decimal?  @db.Decimal(10, 6)
  currency     String?   @default("usd")

  // Arbitrary details
  metadata     Json?

  @@index([apiKeyId, createdAt])
  @@index([userId, createdAt])
  @@index([provider, model])
}
```

**Fields**:

- `id`: Unique identifier with `use_` prefix
- `apiKeyId`: Foreign key to ApiKey model
- `userId`: Foreign key to Clerk user ID
- `provider`: AI provider (openai, replicate, etc.)
- `model`: AI model used
- `type`: Type of usage (chat, image, embeddings)
- `tokensIn`: Input tokens
- `tokensOut`: Output tokens
- `tokensTotal`: Total tokens
- `cost`: Cost in decimal format
- `currency`: Currency code (default: usd)
- `metadata`: Additional usage metadata as JSON

**Indexes**:

- `[apiKeyId, createdAt]`: Optimizes usage queries by API key
- `[userId, createdAt]`: Optimizes usage queries by user
- `[provider, model]`: Optimizes usage analytics by provider/model

## 🔗 Entity Relationships

### Relationship Diagram

```
User (Clerk)
├── ApiKey (1:N)
│   └── Usage (1:N)
├── Agent (1:N)
│   └── Thread (1:N)
└── UserSubscription (1:N)
    └── Package (N:1)
```

### Detailed Relationships

1. **User → ApiKey (1:N)**

   - One user can have multiple API keys
   - API keys are tied to a specific user

2. **ApiKey → Usage (1:N)**

   - One API key can have multiple usage records
   - Usage records track API key consumption

3. **User → Agent (1:N)**

   - One user can create multiple agents
   - Agents are user-specific

4. **Agent → Thread (1:N)**

   - One agent can have multiple threads
   - Threads can optionally be associated with an agent

5. **User → Thread (1:N)**

   - One user can have multiple threads
   - Threads are always tied to a user

6. **User → UserSubscription (1:N)**

   - One user can have multiple subscriptions
   - Subscriptions track user's package access

7. **Package → UserSubscription (1:N)**
   - One package can have multiple subscriptions
   - Subscriptions reference specific packages

## 🗂️ Database Design Patterns

### 1. UUID Primary Keys

All entities use UUIDs with descriptive prefixes:

- `key_` for ApiKey
- `agnt_` for Agent
- `thrd_` for Thread
- `pkg_` for Package
- `sub_` for UserSubscription
- `use_` for Usage

### 2. Soft Deletes

Important entities use soft deletion:

- `Agent.deletedAt`
- `Thread.deletedAt`

### 3. Audit Trail

All entities include timestamps:

- `createdAt`: Record creation time
- `updatedAt`: Last modification time

### 4. JSON Fields

Flexible data storage using JSON:

- `Agent.tools`: Tool configurations
- `Usage.metadata`: Additional usage data

## 📈 Performance Optimizations

### Indexes

1. **Composite Indexes**:

   - `[userId, active]` on ApiKey
   - `[apiKeyId, createdAt]` on Usage
   - `[userId, createdAt]` on Usage

2. **Single Column Indexes**:
   - `keyId` on ApiKey
   - `name` on Agent
   - `agentId` on Thread
   - `packageId` on UserSubscription

### Query Optimization

1. **Pagination**: Use `skip` and `take` for large datasets
2. **Selective Fields**: Only select required fields
3. **Eager Loading**: Use `include` for related data
4. **Connection Pooling**: Configure Prisma connection pool

## 🔧 Database Operations

### Common Queries

```typescript
// Get user's active API keys
const apiKeys = await prisma.apiKey.findMany({
  where: {
    userId: userId,
    active: true,
  },
  orderBy: { createdAt: "desc" },
});

// Get usage statistics
const usage = await prisma.usage.groupBy({
  by: ["provider", "model"],
  where: {
    userId: userId,
    createdAt: {
      gte: startDate,
      lte: endDate,
    },
  },
  _sum: {
    tokensTotal: true,
    cost: true,
  },
});

// Get agent with threads
const agent = await prisma.agent.findUnique({
  where: { id: agentId },
  include: {
    threads: {
      where: { deletedAt: null },
      orderBy: { createdAt: "desc" },
    },
  },
});
```

### Transaction Examples

```typescript
// Create API key with usage tracking
const result = await prisma.$transaction(async (tx) => {
  const apiKey = await tx.apiKey.create({
    data: {
      keyId: generateKeyId(),
      hashedKey: await hashKey(plainKey),
      userId: userId,
      name: keyName,
    },
  });

  const usage = await tx.usage.create({
    data: {
      apiKeyId: apiKey.id,
      userId: userId,
      provider: "openai",
      model: "gpt-4",
      type: "chat",
      tokensTotal: 0,
      cost: 0,
    },
  });

  return { apiKey, usage };
});
```

## 🚀 Migration Strategy

### Development Migrations

```bash
# Create new migration
npx prisma migrate dev --name add_new_field

# Reset database (development only)
npx prisma migrate reset

# Generate Prisma client
npx prisma generate
```

### Production Migrations

```bash
# Deploy migrations
npx prisma migrate deploy

# Generate Prisma client
npx prisma generate
```

## 🔍 Data Validation

### Prisma Validation

- **Required Fields**: Enforced at database level
- **Unique Constraints**: Prevent duplicate data
- **Foreign Keys**: Maintain referential integrity
- **Data Types**: Type safety through Prisma

### Application Validation

```typescript
// Zod schema for API key creation
const createApiKeySchema = z.object({
  name: z.string().min(1).max(255),
  permissions: z.array(z.string()),
  expiresAt: z.date().optional(),
});
```

## 📊 Monitoring and Analytics

### Usage Analytics

```typescript
// Daily usage by user
const dailyUsage = await prisma.usage.groupBy({
  by: ["userId", "createdAt"],
  where: {
    createdAt: {
      gte: startOfDay,
      lt: endOfDay,
    },
  },
  _sum: {
    tokensTotal: true,
    cost: true,
  },
});
```

### Performance Monitoring

- **Query Performance**: Monitor slow queries
- **Connection Pool**: Track connection usage
- **Index Usage**: Analyze index effectiveness
- **Storage Growth**: Monitor database size

## 🔒 Security Considerations

### Data Protection

1. **Encryption**: Sensitive data encrypted at rest
2. **Access Control**: Row-level security through user IDs
3. **Audit Logging**: Track all data modifications
4. **Backup Strategy**: Regular automated backups

### API Key Security

1. **Hashing**: API keys hashed before storage
2. **Rotation**: Support for key rotation
3. **Permissions**: Granular permission system
4. **Rate Limiting**: Prevent abuse

## 📚 Related Documentation

- [Architecture Overview](./overview.md)
- [Services Documentation](./services.md)
- [API Reference](../api/README.md)
- [Development Guide](../development/README.md)
