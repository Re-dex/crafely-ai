# Getting Started

This guide will help you set up the Crafely AI Node application for local development.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** (v8 or higher)
- **PostgreSQL** (v13 or higher)
- **Git**

## Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd crafely-ai-node
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Configure the following environment variables:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/crafely_ai"

# OpenAI
OPENAI_API_KEY="your_openai_api_key"
OPENAI_MODEL="gpt-4"
OPENAI_TEMPERATURE="0.7"

# Clerk Authentication
CLERK_SECRET_KEY="your_clerk_secret_key"
CLERK_PUBLISHABLE_KEY="your_clerk_publishable_key"

# Replicate
REPLICATE_API_TOKEN="your_replicate_token"

# Redis (Optional)
REDIS_URL="redis://localhost:6379"

# Server
PORT=4000
NODE_ENV="development"
```

### 4. Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# (Optional) Seed the database
npm run prisma:seed
```

### 5. Build CSS (Optional)

If you're working with styles:

```bash
npm run build:css
# or watch for changes
npm run watch:css
```

## Running the Application

### Development Mode

```bash
npm run serve
```

This will start the server with hot reloading using nodemon.

### Production Mode

```bash
npm run build
npm start
```

### Build CSS

```bash
npm run build:css
```

## Project Structure

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

## Development Workflow

### 1. Code Standards

- Use TypeScript for all new code
- Follow ES6+ syntax
- Use meaningful variable and function names
- Add JSDoc comments for complex functions
- Use Prettier for code formatting

### 2. Git Workflow

```bash
# Create a feature branch
git checkout -b feature/your-feature-name

# Make your changes and commit
git add .
git commit -m "feat: add your feature description"

# Push and create PR
git push origin feature/your-feature-name
```

### 3. Database Changes

When making database changes:

```bash
# Create a new migration
npx prisma migrate dev --name your_migration_name

# Reset database (development only)
npx prisma migrate reset
```

### 4. Testing

Currently, the project doesn't have automated tests. When adding tests:

```bash
# Install testing dependencies
npm install --save-dev jest @types/jest ts-jest

# Run tests
npm test
```

## Common Issues

### Port Already in Use

If port 4000 is already in use:

```bash
# Kill the process using port 4000
lsof -ti:4000 | xargs kill -9

# Or use a different port
PORT=4001 npm run serve
```

### Database Connection Issues

1. Ensure PostgreSQL is running
2. Check your `DATABASE_URL` in `.env`
3. Verify database credentials
4. Run `npx prisma migrate dev` to ensure schema is up to date

### Prisma Client Issues

```bash
# Regenerate Prisma client
npx prisma generate

# Reset and recreate database
npx prisma migrate reset
```

## Next Steps

- Read the [Architecture Overview](../architecture/overview.md)
- Check the [API Reference](../api/README.md)
- Review the [Development Guide](./README.md)

## Getting Help

- Check the [FAQ](./faq.md)
- Review existing issues in the repository
- Create a new issue with detailed information about your problem
