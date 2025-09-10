# Development Guide

This guide covers development standards, workflows, and best practices for the Crafely AI Node application.

## 📋 Table of Contents

- [Code Standards](#code-standards)
- [Project Structure](#project-structure)
- [Development Workflow](#development-workflow)
- [Testing Guidelines](#testing-guidelines)
- [API Development](#api-development)
- [Database Development](#database-development)
- [Error Handling](#error-handling)
- [Performance Guidelines](#performance-guidelines)
- [Security Guidelines](#security-guidelines)

## Code Standards

### TypeScript Guidelines

- Use TypeScript for all new code
- Enable strict mode in `tsconfig.json`
- Use explicit types instead of `any`
- Prefer interfaces over types for object shapes
- Use enums for constants

```typescript
// ✅ Good
interface User {
  id: string;
  email: string;
  createdAt: Date;
}

// ❌ Bad
const user: any = { id: 1, email: "test@example.com" };
```

### ES6+ Syntax

- Use arrow functions for callbacks
- Use destructuring for object properties
- Use template literals for strings
- Use async/await instead of Promises

```typescript
// ✅ Good
const { id, email } = user;
const message = `Hello ${name}!`;
const result = await someAsyncFunction();

// ❌ Bad
const id = user.id;
const email = user.email;
const message = "Hello " + name + "!";
someAsyncFunction().then((result) => {});
```

### Vue.js Guidelines (if applicable)

- Use Composition API with `<script setup>`
- Use TypeScript for component props and emits
- Use reactive refs for state management
- Follow Vue 3 best practices

```vue
<script setup lang="ts">
interface Props {
  title: string;
  count: number;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  update: [value: string];
}>();

const isVisible = ref(false);
</script>
```

### Naming Conventions

- Use camelCase for variables and functions
- Use PascalCase for classes and interfaces
- Use UPPER_SNAKE_CASE for constants
- Use descriptive names that explain intent

```typescript
// ✅ Good
const userService = new UserService();
const MAX_RETRY_ATTEMPTS = 3;
const calculateTotalPrice = (items: Item[]) => {};

// ❌ Bad
const us = new UserService();
const max = 3;
const calc = (items: Item[]) => {};
```

## Project Structure

### Directory Organization

```
src/
├── app/                 # Base application classes
│   ├── ApiResponse.ts   # Standardized API response class
│   └── BaseController.ts # Base controller with common functionality
├── config/             # Configuration files
│   └── env.config.ts   # Environment variable configuration
├── controllers/        # HTTP request handlers
│   ├── chat.controller.ts
│   ├── agent.controller.ts
│   └── ...
├── database/           # Database connection and Prisma setup
│   ├── connection.ts   # Database connection
│   └── prisma.ts       # Prisma client instance
├── middleware/         # Express middleware
│   ├── apiKeyToken.middleware.ts
│   ├── jwt.middleware.ts
│   └── validate.middleware.ts
├── routes/            # API route definitions
│   ├── index.ts       # Main router
│   ├── chat.routes.ts
│   └── ...
├── services/          # Business logic and external API integrations
│   ├── openai.service.ts
│   ├── agent.service.ts
│   └── ...
├── types/             # TypeScript type definitions
│   ├── agent.types.ts
│   ├── package.types.ts
│   └── globals.d.ts
├── utils/             # Utility functions
│   ├── chat.utils.ts
│   └── signature.utils.ts
├── validator/         # Request validation schemas
│   ├── chat.validator.ts
│   └── agent.validator.ts
└── views/             # EJS templates
    └── index.ejs
```

### File Naming

- Use kebab-case for file names
- Use descriptive names that indicate purpose
- Group related files in directories

```
✅ Good
- user.service.ts
- chat.controller.ts
- api-key.middleware.ts

❌ Bad
- user.ts
- chat.ts
- middleware.ts
```

## Development Workflow

### 1. Feature Development

```bash
# Create feature branch
git checkout -b feature/your-feature-name

# Make changes
# ... code changes ...

# Test locally
npm run serve

# Commit changes
git add .
git commit -m "feat: add your feature description"

# Push and create PR
git push origin feature/your-feature-name
```

### 2. Code Review Process

- All code must be reviewed before merging
- Use descriptive commit messages
- Follow conventional commit format
- Ensure tests pass (when available)

### 3. Database Changes

```bash
# Create migration
npx prisma migrate dev --name your_migration_name

# Update Prisma client
npx prisma generate

# Reset database (development only)
npx prisma migrate reset
```

## Testing Guidelines

### Unit Testing

```typescript
// Example test structure
describe("UserService", () => {
  let userService: UserService;

  beforeEach(() => {
    userService = new UserService();
  });

  describe("createUser", () => {
    it("should create a user successfully", async () => {
      const userData = { email: "test@example.com", name: "Test User" };
      const result = await userService.createUser(userData);

      expect(result).toBeDefined();
      expect(result.email).toBe(userData.email);
    });
  });
});
```

### Integration Testing

```typescript
// Example API test
describe("POST /api/v1/chat/completion", () => {
  it("should return chat completion", async () => {
    const response = await request(app)
      .post("/api/v1/chat/completion")
      .set("Authorization", "Bearer valid-api-key")
      .send({ message: "Hello, world!" })
      .expect(200);

    expect(response.body).toHaveProperty("message");
    expect(response.body).toHaveProperty("usage");
  });
});
```

## API Development

### Controller Structure

```typescript
export class ChatController extends BaseController {
  private chatService: ChatService;

  constructor() {
    super();
    this.chatService = new ChatService();
  }

  async completion(req: Request, res: Response) {
    this.handleRequest(req, res, async () => {
      const response = await this.chatService.streamChat(req.body, res);
      return this.handleResponse("Chat completion successful", response);
    });
  }
}
```

### Service Structure

```typescript
export class ChatService {
  async streamChat(data: ChatRequest, res: Response): Promise<ChatResponse> {
    try {
      // Implementation
      return response;
    } catch (error) {
      console.error("Chat service error:", error);
      throw error;
    }
  }
}
```

### Route Structure

```typescript
const router = Router();

// Middleware
router.use(apiKeyMiddleware);

// Routes
router.post("/completion", chatController.completion.bind(chatController));
router.get("/messages", chatController.getMessages.bind(chatController));

export default router;
```

## Database Development

### Prisma Schema

```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("users")
}
```

### Service Methods

```typescript
export class UserService {
  async create(data: CreateUserDTO): Promise<User> {
    return prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
      },
    });
  }

  async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id },
    });
  }
}
```

## Error Handling

### Controller Error Handling

```typescript
async someMethod(req: Request, res: Response) {
  this.handleRequest(req, res, async () => {
    try {
      const result = await this.service.someOperation();
      return this.handleResponse("Operation successful", result);
    } catch (error) {
      console.error('Operation failed:', error);
      throw error; // BaseController will handle the error
    }
  });
}
```

### Service Error Handling

```typescript
async someOperation(): Promise<Result> {
  try {
    // Implementation
    return result;
  } catch (error) {
    console.error('Service error:', error);
    throw new Error(`Operation failed: ${error.message}`);
  }
}
```

## Performance Guidelines

### Database Queries

- Use indexes for frequently queried fields
- Avoid N+1 queries
- Use pagination for large datasets
- Use database transactions for related operations

### API Performance

- Implement rate limiting
- Use caching where appropriate
- Optimize response payloads
- Use streaming for large responses

### Memory Management

- Clean up resources after use
- Use connection pooling
- Monitor memory usage
- Implement proper error handling

## Security Guidelines

### Input Validation

- Validate all input data
- Use Zod schemas for validation
- Sanitize user input
- Implement proper error messages

### Authentication

- Use secure API key generation
- Implement proper JWT handling
- Use HTTPS in production
- Implement rate limiting

### Data Protection

- Encrypt sensitive data
- Use environment variables for secrets
- Implement proper access controls
- Regular security audits

## Code Documentation

### JSDoc Comments

```typescript
/**
 * Creates a new user in the system
 * @param data - User creation data
 * @returns Promise<User> - The created user
 * @throws {Error} When user creation fails
 */
async createUser(data: CreateUserDTO): Promise<User> {
  // Implementation
}
```

### README Files

- Document complex modules
- Include usage examples
- Document configuration options
- Keep documentation up to date

## Troubleshooting

### Common Issues

1. **TypeScript Errors**: Check tsconfig.json and ensure proper types
2. **Database Connection**: Verify DATABASE_URL and Prisma setup
3. **API Key Issues**: Check middleware configuration
4. **Memory Issues**: Monitor Node.js memory usage

### Debugging

```typescript
// Use console.log for debugging
console.log("Debug info:", { data, context });

// Use proper logging in production
logger.info("Operation completed", { userId, operation });
```

## Contributing

1. Follow the code standards outlined above
2. Write tests for new features
3. Update documentation
4. Create descriptive pull requests
5. Respond to code review feedback

## Resources

- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [Vue.js Guide](https://vuejs.org/guide/)
