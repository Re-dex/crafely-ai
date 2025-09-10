# Code Standards

This document outlines the coding standards, conventions, and best practices for the Crafely AI Node application.

## 📋 Table of Contents

- [General Principles](#general-principles)
- [TypeScript Standards](#typescript-standards)
- [Vue.js Standards](#vuejs-standards)
- [Naming Conventions](#naming-conventions)
- [File Organization](#file-organization)
- [Code Documentation](#code-documentation)
- [Error Handling](#error-handling)
- [Testing Standards](#testing-standards)
- [Performance Guidelines](#performance-guidelines)
- [Security Guidelines](#security-guidelines)

## 🎯 General Principles

### 1. Code Quality

- **Readability**: Code should be self-documenting and easy to understand
- **Maintainability**: Code should be easy to modify and extend
- **Consistency**: Follow established patterns and conventions
- **Simplicity**: Prefer simple solutions over complex ones
- **DRY**: Don't Repeat Yourself - avoid code duplication

### 2. Development Workflow

- **Small Commits**: Make frequent, small commits with descriptive messages
- **Code Reviews**: All code must be reviewed before merging
- **Testing**: Write tests for new features and bug fixes
- **Documentation**: Update documentation when adding features

### 3. Code Organization

- **Separation of Concerns**: Keep different responsibilities in separate modules
- **Single Responsibility**: Each function/class should have one clear purpose
- **Dependency Injection**: Use dependency injection for better testability
- **Interface Segregation**: Create focused interfaces

## 🔷 TypeScript Standards

### 1. Type Safety

```typescript
// ✅ Good - Explicit types
interface User {
  id: string;
  email: string;
  createdAt: Date;
}

function createUser(userData: CreateUserDTO): Promise<User> {
  // Implementation
}

// ❌ Bad - Using any
function createUser(userData: any): any {
  // Implementation
}
```

### 2. Interface vs Type

```typescript
// ✅ Good - Use interfaces for object shapes
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

// ✅ Good - Use types for unions and primitives
type Status = "pending" | "active" | "inactive";
type UserId = string;
```

### 3. Generic Types

```typescript
// ✅ Good - Use generics for reusable components
interface Repository<T> {
  findById(id: string): Promise<T | null>;
  create(data: Partial<T>): Promise<T>;
  update(id: string, data: Partial<T>): Promise<T>;
}

class UserRepository implements Repository<User> {
  // Implementation
}
```

### 4. Optional Properties

```typescript
// ✅ Good - Use optional properties appropriately
interface CreateUserDTO {
  email: string;
  name?: string;
  age?: number;
}

// ✅ Good - Use required properties when needed
interface User {
  id: string;
  email: string;
  name: string; // Required
  createdAt: Date;
}
```

### 5. Enums

```typescript
// ✅ Good - Use enums for constants
enum UserRole {
  ADMIN = "admin",
  USER = "user",
  MODERATOR = "moderator",
}

// ✅ Good - Use const enums for better performance
const enum ApiStatus {
  SUCCESS = 200,
  NOT_FOUND = 404,
  ERROR = 500,
}
```

## 🟢 Vue.js Standards

### 1. Composition API

```vue
<script setup lang="ts">
// ✅ Good - Use Composition API with TypeScript
interface Props {
  title: string;
  count: number;
  isVisible?: boolean;
}

interface Emits {
  update: [value: string];
  delete: [id: string];
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const isExpanded = ref(false);
const items = ref<string[]>([]);

const toggleExpanded = () => {
  isExpanded.value = !isExpanded.value;
};
</script>
```

### 2. Component Structure

```vue
<template>
  <!-- ✅ Good - Clear template structure -->
  <div class="user-card">
    <header class="user-card__header">
      <h3 class="user-card__title">{{ title }}</h3>
      <button class="user-card__toggle" @click="toggleExpanded">
        {{ isExpanded ? "Collapse" : "Expand" }}
      </button>
    </header>

    <div v-if="isExpanded" class="user-card__content">
      <p class="user-card__count">Count: {{ count }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
// Component logic
</script>

<style scoped>
/* Component styles */
</style>
```

### 3. Props and Emits

```typescript
// ✅ Good - Define props with validation
interface Props {
  title: string;
  count: number;
  items: string[];
  isVisible?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  isVisible: true,
});

// ✅ Good - Define emits with types
interface Emits {
  update: [value: string];
  delete: [id: string];
  change: [newValue: string];
}

const emit = defineEmits<Emits>();
```

### 4. Reactive Data

```typescript
// ✅ Good - Use ref for primitive values
const count = ref(0);
const message = ref("");

// ✅ Good - Use reactive for objects
const user = reactive({
  id: "",
  name: "",
  email: "",
});

// ✅ Good - Use computed for derived values
const doubleCount = computed(() => count.value * 2);
const filteredItems = computed(() =>
  items.value.filter((item) => item.includes(searchTerm.value))
);
```

## 📝 Naming Conventions

### 1. Variables and Functions

```typescript
// ✅ Good - Use camelCase for variables and functions
const userName = "john_doe";
const isUserActive = true;
const getUserById = (id: string) => {};

// ❌ Bad - Inconsistent naming
const user_name = "john_doe";
const IsUserActive = true;
const GetUserById = (id: string) => {};
```

### 2. Classes and Interfaces

```typescript
// ✅ Good - Use PascalCase for classes and interfaces
class UserService {
  // Implementation
}

interface UserRepository {
  // Interface definition
}

// ❌ Bad - Inconsistent naming
class userService {
  // Implementation
}

interface user_repository {
  // Interface definition
}
```

### 3. Constants

```typescript
// ✅ Good - Use UPPER_SNAKE_CASE for constants
const MAX_RETRY_ATTEMPTS = 3;
const API_BASE_URL = "https://api.example.com";
const DEFAULT_PAGE_SIZE = 10;

// ❌ Bad - Inconsistent naming
const maxRetryAttempts = 3;
const apiBaseUrl = "https://api.example.com";
```

### 4. Files and Directories

```
// ✅ Good - Use kebab-case for files and directories
src/
├── user-service.ts
├── api-client.ts
├── user-repository.ts
└── components/
    ├── user-card.vue
    ├── user-list.vue
    └── user-form.vue

// ❌ Bad - Inconsistent naming
src/
├── userService.ts
├── apiClient.ts
├── userRepository.ts
└── components/
    ├── UserCard.vue
    ├── UserList.vue
    └── UserForm.vue
```

## 📁 File Organization

### 1. Directory Structure

```
src/
├── app/                 # Base application classes
├── config/             # Configuration files
├── controllers/        # HTTP request handlers
├── database/           # Database connection and Prisma setup
├── middleware/         # Express middleware
├── routes/            # API route definitions
├── services/          # Business logic and external API integrations
├── types/             # TypeScript type definitions
├── utils/             # Utility functions
├── validator/         # Request validation schemas
└── views/             # EJS templates
```

### 2. File Naming

```
// ✅ Good - Descriptive file names
user.service.ts
chat.controller.ts
api-key.middleware.ts
user.types.ts

// ❌ Bad - Generic or unclear names
service.ts
controller.ts
middleware.ts
types.ts
```

### 3. Import Organization

```typescript
// ✅ Good - Organized imports
// 1. Node modules
import express from "express";
import { Request, Response } from "express";

// 2. Internal modules (absolute paths)
import { UserService } from "@/services/user.service";
import { ApiResponse } from "@/app/ApiResponse";

// 3. Relative imports
import { validateUser } from "./user.validator";
import { UserTypes } from "../types/user.types";
```

## 📚 Code Documentation

### 1. JSDoc Comments

````typescript
/**
 * Service for managing user operations
 * @class UserService
 */
export class UserService {
  /**
   * Creates a new user in the system
   * @param userData - User creation data
   * @returns Promise<User> - The created user
   * @throws {ValidationError} When user data is invalid
   * @throws {DatabaseError} When database operation fails
   * @example
   * ```typescript
   * const user = await userService.createUser({
   *   email: 'user@example.com',
   *   name: 'John Doe'
   * });
   * ```
   */
  async createUser(userData: CreateUserDTO): Promise<User> {
    // Implementation
  }
}
````

### 2. Interface Documentation

```typescript
/**
 * Configuration for the OpenAI service
 * @interface OpenAIConfig
 */
interface OpenAIConfig {
  /** OpenAI API key for authentication */
  apiKey: string;
  /** Model to use for completions */
  model: string;
  /** Temperature for response generation (0-1) */
  temperature: number;
  /** Maximum tokens in response */
  maxTokens?: number;
}
```

### 3. Function Documentation

```typescript
/**
 * Validates user input data
 * @param data - User data to validate
 * @param schema - Validation schema to use
 * @returns ValidationResult - Result of validation
 * @throws {ValidationError} When validation fails
 */
function validateUserData(data: unknown, schema: ZodSchema): ValidationResult {
  // Implementation
}
```

## 🚨 Error Handling

### 1. Error Classes

```typescript
// ✅ Good - Custom error classes
export class ValidationError extends Error {
  constructor(
    message: string,
    public field: string,
    public code: string = "VALIDATION_ERROR"
  ) {
    super(message);
    this.name = "ValidationError";
  }
}

export class DatabaseError extends Error {
  constructor(
    message: string,
    public operation: string,
    public code: string = "DATABASE_ERROR"
  ) {
    super(message);
    this.name = "DatabaseError";
  }
}
```

### 2. Error Handling Patterns

```typescript
// ✅ Good - Proper error handling
async function createUser(userData: CreateUserDTO): Promise<User> {
  try {
    // Validate input
    const validatedData = validateUserData(userData);

    // Create user
    const user = await prisma.user.create({
      data: validatedData,
    });

    return user;
  } catch (error) {
    if (error instanceof ValidationError) {
      throw error; // Re-throw validation errors
    }

    if (error instanceof PrismaClientKnownRequestError) {
      throw new DatabaseError(
        "Failed to create user",
        "create",
        "DATABASE_ERROR"
      );
    }

    throw new Error(`Unexpected error: ${error.message}`);
  }
}
```

### 3. Error Response Format

```typescript
// ✅ Good - Consistent error response format
interface ErrorResponse {
  success: false;
  message: string;
  error: string;
  code?: string;
  details?: any;
  timestamp: string;
}

// Usage in controller
catch (error) {
  const errorResponse: ErrorResponse = {
    success: false,
    message: 'Operation failed',
    error: error.message,
    code: error.code || 'UNKNOWN_ERROR',
    timestamp: new Date().toISOString()
  };

  res.status(500).json(errorResponse);
}
```

## 🧪 Testing Standards

### 1. Unit Testing

```typescript
// ✅ Good - Unit test structure
describe("UserService", () => {
  let userService: UserService;
  let mockRepository: jest.Mocked<UserRepository>;

  beforeEach(() => {
    mockRepository = {
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as any;

    userService = new UserService(mockRepository);
  });

  describe("createUser", () => {
    it("should create a user successfully", async () => {
      // Arrange
      const userData = { email: "test@example.com", name: "Test User" };
      const expectedUser = { id: "1", ...userData };
      mockRepository.create.mockResolvedValue(expectedUser);

      // Act
      const result = await userService.createUser(userData);

      // Assert
      expect(result).toEqual(expectedUser);
      expect(mockRepository.create).toHaveBeenCalledWith(userData);
    });

    it("should throw ValidationError for invalid data", async () => {
      // Arrange
      const invalidData = { email: "invalid-email" };

      // Act & Assert
      await expect(userService.createUser(invalidData)).rejects.toThrow(
        ValidationError
      );
    });
  });
});
```

### 2. Integration Testing

```typescript
// ✅ Good - Integration test structure
describe("User API Integration", () => {
  let app: Express;
  let server: Server;

  beforeAll(async () => {
    app = createApp();
    server = app.listen(0);
  });

  afterAll(async () => {
    server.close();
  });

  it("should create a user via API", async () => {
    const userData = {
      email: "test@example.com",
      name: "Test User",
    };

    const response = await request(app)
      .post("/api/users")
      .send(userData)
      .expect(201);

    expect(response.body.success).toBe(true);
    expect(response.body.data.email).toBe(userData.email);
  });
});
```

## ⚡ Performance Guidelines

### 1. Database Queries

```typescript
// ✅ Good - Optimized database queries
async function getUsersWithPosts(userId: string): Promise<UserWithPosts> {
  return prisma.user.findUnique({
    where: { id: userId },
    include: {
      posts: {
        select: {
          id: true,
          title: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
        take: 10,
      },
    },
  });
}

// ❌ Bad - N+1 query problem
async function getUsersWithPosts(userId: string): Promise<UserWithPosts> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  const posts = await prisma.post.findMany({ where: { userId } });
  return { ...user, posts };
}
```

### 2. Caching

```typescript
// ✅ Good - Implement caching
class CachedUserService {
  private cache = new Map<string, User>();

  async getUserById(id: string): Promise<User> {
    if (this.cache.has(id)) {
      return this.cache.get(id)!;
    }

    const user = await this.userRepository.findById(id);
    this.cache.set(id, user);
    return user;
  }
}
```

### 3. Async Operations

```typescript
// ✅ Good - Proper async handling
async function processUsers(users: User[]): Promise<void> {
  const promises = users.map((user) => processUser(user));
  await Promise.all(promises);
}

// ❌ Bad - Sequential processing
async function processUsers(users: User[]): Promise<void> {
  for (const user of users) {
    await processUser(user);
  }
}
```

## 🔒 Security Guidelines

### 1. Input Validation

```typescript
// ✅ Good - Validate all inputs
import { z } from "zod";

const createUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(100),
  age: z.number().min(0).max(120).optional(),
});

function createUser(userData: unknown): User {
  const validatedData = createUserSchema.parse(userData);
  // Process validated data
}
```

### 2. Authentication

```typescript
// ✅ Good - Secure authentication
function authenticateUser(token: string): User {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    return decoded as User;
  } catch (error) {
    throw new AuthenticationError("Invalid token");
  }
}
```

### 3. Data Sanitization

```typescript
// ✅ Good - Sanitize user input
import DOMPurify from "dompurify";

function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html);
}

function sanitizeUserInput(input: string): string {
  return input.trim().replace(/[<>]/g, "");
}
```

## 📊 Code Metrics

### 1. Complexity

- **Cyclomatic Complexity**: Keep functions under 10
- **Function Length**: Keep functions under 50 lines
- **File Length**: Keep files under 300 lines
- **Nesting Depth**: Keep nesting under 4 levels

### 2. Coverage

- **Unit Tests**: Aim for 80%+ coverage
- **Integration Tests**: Cover critical paths
- **E2E Tests**: Cover user workflows

### 3. Performance

- **Response Time**: API responses under 200ms
- **Memory Usage**: Monitor memory consumption
- **Database Queries**: Optimize query performance

## 🔧 Tools and Linting

### 1. ESLint Configuration

```json
{
  "extends": ["@typescript-eslint/recommended", "prettier"],
  "rules": {
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/explicit-function-return-type": "warn",
    "prefer-const": "error",
    "no-var": "error"
  }
}
```

### 2. Prettier Configuration

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2
}
```

### 3. TypeScript Configuration

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

## 📚 Related Documentation

- [Development Guide](./README.md)
- [Getting Started](./getting-started.md)
- [Architecture Overview](../architecture/overview.md)
- [API Reference](../api/README.md)
