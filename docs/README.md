# Crafely AI Node Documentation

Welcome to the Crafely AI Node documentation. This is a comprehensive Node.js application built with TypeScript, Express, and Prisma that provides AI-powered services including chat completions, image generation, and agent management.

## 📚 Documentation Structure

- **[Getting Started](./development/getting-started.md)** - Setup and installation guide
- **[Architecture Overview](./architecture/overview.md)** - System architecture and design patterns
- **[API Reference](./api/README.md)** - Complete API documentation
- **[Database Schema](./architecture/database.md)** - Database models and relationships
- **[Services](./architecture/services.md)** - Service layer documentation
- **[Development Guide](./development/README.md)** - Development workflows and standards
- **[Deployment](./deployment/README.md)** - Deployment and production setup

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Setup environment variables
cp .env.example .env

# Run database migrations
npx prisma migrate dev

# Start development server
npm run serve
```

## 🏗️ Architecture

This application follows a layered architecture pattern:

- **Controllers** - Handle HTTP requests and responses
- **Services** - Business logic and external API integrations
- **Models** - Database entities via Prisma
- **Middleware** - Authentication, validation, and request processing
- **Routes** - API endpoint definitions
- **Types** - TypeScript type definitions

## 🔧 Key Features

- **AI Chat Completions** - OpenAI GPT integration with streaming
- **Image Generation** - Replicate AI image generation
- **Agent Management** - Create and manage AI agents
- **Thread Management** - Conversation thread handling
- **Usage Tracking** - Token usage and cost tracking
- **API Key Management** - Secure API key handling
- **Package Management** - Subscription and billing packages

## 🛠️ Tech Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Clerk
- **AI Services**: OpenAI, Replicate
- **Styling**: Tailwind CSS
- **Deployment**: Vercel

## 📖 API Endpoints

### Public Routes

- `GET /` - Landing page
- `POST /api/v1/package/*` - Package management

### Protected Routes (API Key Required)

- `POST /api/v1/chat/completion` - Chat completions
- `POST /api/v1/chat/image` - Image generation
- `GET /api/v1/chat/messages` - Get chat messages
- `POST /api/v1/thread/*` - Thread management
- `GET /api/v1/usage/*` - Usage tracking

### Admin Routes (JWT Required)

- `POST /api/v1/admin/api-key/*` - API key management
- `POST /api/v1/admin/agent/*` - Agent management
- `GET /api/v1/admin/usage/*` - Usage analytics

## 🔐 Authentication

The application uses two authentication methods:

1. **Clerk JWT** - For admin routes and user management
2. **API Keys** - For protected API endpoints

## 📊 Database

The application uses PostgreSQL with Prisma ORM. Key models include:

- **ApiKey** - API key management and tracking
- **Agent** - AI agent configurations
- **Thread** - Conversation threads
- **Package** - Subscription packages
- **Usage** - Token usage tracking

## 🚀 Development

See the [Development Guide](./development/README.md) for detailed information about:

- Code standards and conventions
- Testing procedures
- Contributing guidelines
- Environment setup

## 📝 License

This project is licensed under the ISC License.

## 🤝 Contributing

Please read our contributing guidelines in the [Development Guide](./development/README.md) before submitting pull requests.

## 📞 Support

For support and questions, please refer to the documentation or create an issue in the repository.
