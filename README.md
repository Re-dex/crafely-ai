# Crafely AI Node

A comprehensive Node.js application built with TypeScript, Express, and Prisma that provides AI-powered services including chat completions, image generation, agent management, and usage tracking.

## 🚀 Features

- **AI Chat Completions** - OpenAI GPT integration with streaming support
- **Image Generation** - Replicate AI image generation
- **Agent Management** - Create and manage AI agents with custom instructions
- **Thread Management** - Conversation thread handling and persistence
- **Usage Tracking** - Token usage and cost tracking
- **API Key Management** - Secure API key handling and validation
- **Package Management** - Subscription and billing packages
- **Real-time Streaming** - Server-sent events for real-time responses

## 🛠️ Tech Stack

- **Runtime**: Node.js 18+ with TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Clerk
- **AI Services**: OpenAI, Replicate
- **Styling**: Tailwind CSS
- **Deployment**: Vercel, Railway, Docker

## 📚 Documentation

- **[Getting Started](docs/development/getting-started.md)** - Setup and installation guide
- **[Architecture Overview](docs/architecture/overview.md)** - System architecture and design patterns
- **[API Reference](docs/api/README.md)** - Complete API documentation
- **[Database Schema](docs/architecture/database.md)** - Database models and relationships
- **[Services](docs/architecture/services.md)** - Service layer documentation
- **[Development Guide](docs/development/README.md)** - Development workflows and standards
- **[Deployment](docs/deployment/README.md)** - Deployment and production setup

## 🚀 Quick Start

### Prerequisites

- Node.js 18 or higher
- PostgreSQL 13 or higher
- npm 8 or higher

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd crafely-ai-node
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Setup environment variables**

   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Setup database**

   ```bash
   npx prisma migrate dev
   npx prisma generate
   ```

5. **Start development server**
   ```bash
   npm run serve
   ```

The application will be available at `http://localhost:4000`

## 🔧 Available Scripts

- `npm start` - Start production server
- `npm run serve` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm run build:css` - Build Tailwind CSS
- `npm run watch:css` - Watch and build CSS changes
- `npm run prisma:seed` - Seed database with sample data

## 📖 API Usage

### Authentication

The API uses two authentication methods:

1. **Clerk JWT** - For admin routes and user management
2. **API Keys** - For protected API endpoints

### Example API Calls

```typescript
// Chat completion
const response = await fetch("/api/v1/chat/completion", {
  method: "POST",
  headers: {
    Authorization: "Bearer your_api_key",
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    message: "Hello, world!",
    sessionId: "session_123",
  }),
});

// Image generation
const imageResponse = await fetch("/api/v1/chat/image", {
  method: "POST",
  headers: {
    Authorization: "Bearer your_api_key",
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    prompt: "A beautiful sunset over mountains",
  }),
});
```

## 🏗️ Project Structure

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

## 🔐 Environment Variables

```env
# Database
DATABASE_URL="postgresql://username:password@host:port/database"

# OpenAI
OPENAI_API_KEY="your_openai_api_key"
OPENAI_MODEL="gpt-4"
OPENAI_TEMPERATURE="0.7"

# Clerk Authentication
CLERK_SECRET_KEY="your_clerk_secret_key"
CLERK_PUBLISHABLE_KEY="your_clerk_publishable_key"

# Replicate
REPLICATE_API_TOKEN="your_replicate_token"

# Server
PORT=4000
NODE_ENV="development"
```

## 🚀 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables
vercel env add DATABASE_URL
vercel env add OPENAI_API_KEY
# ... add other variables

# Deploy to production
vercel --prod
```

### Railway

```bash
# Install Railway CLI
npm install -g @railway/cli

# Deploy
railway init
railway add postgresql
railway up
```

### Docker

```bash
# Build and start
docker-compose up -d

# Run migrations
docker-compose exec app npx prisma migrate deploy
```

## 🧪 Testing

Currently, the project doesn't have automated tests. To test manually:

1. Start the development server
2. Use tools like Postman or curl to test endpoints
3. Check the browser console for errors
4. Monitor the server logs

## 📊 Monitoring

- **Health Check**: `GET /health`
- **Database Health**: `GET /health/db`
- **Usage Analytics**: `GET /api/v1/admin/usage`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check the [docs](docs/) directory
- **Issues**: Create an issue on GitHub
- **Discussions**: Use GitHub Discussions for questions

## 🔮 Roadmap

- [ ] Automated testing suite
- [ ] GraphQL API layer
- [ ] Real-time WebSocket support
- [ ] Advanced analytics dashboard
- [ ] Multi-tenant support
- [ ] Plugin system

## 📞 Contact

- **Website**: [crafely.com](https://crafely.com)
- **Email**: support@crafely.com
- **Twitter**: [@crafely_ai](https://twitter.com/crafely_ai)

---

Made with ❤️ by the Crafely AI Team
