# Deployment Guide

This guide covers deploying the Crafely AI Node application to various platforms and environments.

## 🚀 Deployment Overview

The application is designed to be deployed on modern cloud platforms with support for:

- **Vercel** (Recommended for serverless)
- **Railway** (Full-stack deployment)
- **Docker** (Containerized deployment)
- **Traditional VPS** (Self-hosted)

## 📋 Prerequisites

Before deploying, ensure you have:

- Node.js 18+ installed locally
- Database (PostgreSQL) set up
- Environment variables configured
- Domain name (for production)

## 🔧 Environment Configuration

### Required Environment Variables

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

# Redis (Optional)
REDIS_URL="redis://username:password@host:port"

# Server
PORT=4000
NODE_ENV="production"
```

### Optional Environment Variables

```env
# Monitoring
SENTRY_DSN="your_sentry_dsn"
LOG_LEVEL="info"

# Rate Limiting
RATE_LIMIT_WINDOW_MS="900000"
RATE_LIMIT_MAX="100"

# CORS
CORS_ORIGIN="https://yourdomain.com"
```

## 🌐 Vercel Deployment

### 1. Prepare for Vercel

Create `vercel.json` in the root directory:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "src/index.ts",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "src/index.ts"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

### 2. Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Set environment variables
vercel env add DATABASE_URL
vercel env add OPENAI_API_KEY
vercel env add CLERK_SECRET_KEY
vercel env add CLERK_PUBLISHABLE_KEY
vercel env add REPLICATE_API_TOKEN

# Deploy to production
vercel --prod
```

### 3. Vercel Configuration

- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`
- **Node.js Version**: 18.x

## 🚂 Railway Deployment

### 1. Prepare for Railway

Create `railway.json`:

```json
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm start",
    "healthcheckPath": "/",
    "healthcheckTimeout": 100
  }
}
```

### 2. Deploy to Railway

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Initialize project
railway init

# Add PostgreSQL database
railway add postgresql

# Set environment variables
railway variables set NODE_ENV=production
railway variables set OPENAI_API_KEY=your_key
railway variables set CLERK_SECRET_KEY=your_key
railway variables set CLERK_PUBLISHABLE_KEY=your_key
railway variables set REPLICATE_API_TOKEN=your_token

# Deploy
railway up
```

## 🐳 Docker Deployment

### 1. Create Dockerfile

```dockerfile
# Use Node.js 18 Alpine
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Expose port
EXPOSE 4000

# Start application
CMD ["npm", "start"]
```

### 2. Create docker-compose.yml

```yaml
version: "3.8"

services:
  app:
    build: .
    ports:
      - "4000:4000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://postgres:password@db:5432/crafely_ai
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - CLERK_SECRET_KEY=${CLERK_SECRET_KEY}
      - CLERK_PUBLISHABLE_KEY=${CLERK_PUBLISHABLE_KEY}
      - REPLICATE_API_TOKEN=${REPLICATE_API_TOKEN}
    depends_on:
      - db
      - redis

  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=crafely_ai
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

volumes:
  postgres_data:
```

### 3. Deploy with Docker

```bash
# Build and start services
docker-compose up -d

# Run database migrations
docker-compose exec app npx prisma migrate deploy

# View logs
docker-compose logs -f app
```

## 🖥️ VPS Deployment

### 1. Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib -y

# Install Redis
sudo apt install redis-server -y

# Install PM2
sudo npm install -g pm2
```

### 2. Database Setup

```bash
# Switch to postgres user
sudo -u postgres psql

# Create database and user
CREATE DATABASE crafely_ai;
CREATE USER crafely_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE crafely_ai TO crafely_user;
\q
```

### 3. Application Deployment

```bash
# Clone repository
git clone <repository-url>
cd crafely-ai-node

# Install dependencies
npm install

# Build application
npm run build

# Set environment variables
cp .env.example .env
nano .env

# Run database migrations
npx prisma migrate deploy

# Start with PM2
pm2 start dist/index.js --name "crafely-ai"
pm2 save
pm2 startup
```

### 4. Nginx Configuration

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 🔒 SSL/HTTPS Setup

### Using Let's Encrypt

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Obtain SSL certificate
sudo certbot --nginx -d yourdomain.com

# Test renewal
sudo certbot renew --dry-run
```

### Using Cloudflare

1. Add your domain to Cloudflare
2. Update nameservers
3. Enable SSL/TLS encryption
4. Configure SSL mode to "Full (strict)"

## 📊 Monitoring and Logging

### PM2 Monitoring

```bash
# View application status
pm2 status

# View logs
pm2 logs crafely-ai

# Monitor resources
pm2 monit

# Restart application
pm2 restart crafely-ai
```

### Log Management

```bash
# Install logrotate
sudo apt install logrotate -y

# Configure log rotation
sudo nano /etc/logrotate.d/crafely-ai
```

Log rotation configuration:

```
/var/log/crafely-ai/*.log {
    daily
    missingok
    rotate 7
    compress
    delaycompress
    notifempty
    create 644 www-data www-data
    postrotate
        pm2 reloadLogs
    endscript
}
```

## 🔄 CI/CD Pipeline

### GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: "18"
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm test

      - name: Build application
        run: npm run build

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: "--prod"
```

## 🚨 Health Checks

### Application Health Check

```typescript
// Add to src/index.ts
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: process.env.npm_package_version,
  });
});
```

### Database Health Check

```typescript
// Add to src/index.ts
app.get("/health/db", async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({ status: "healthy", database: "connected" });
  } catch (error) {
    res.status(500).json({ status: "unhealthy", database: "disconnected" });
  }
});
```

## 🔧 Performance Optimization

### Production Optimizations

1. **Enable Compression**

```typescript
import compression from "compression";
app.use(compression());
```

2. **Set Security Headers**

```typescript
import helmet from "helmet";
app.use(helmet());
```

3. **Configure CORS**

```typescript
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "https://yourdomain.com",
    credentials: true,
  })
);
```

4. **Rate Limiting**

```typescript
import rateLimit from "express-rate-limit";

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});

app.use("/api", limiter);
```

## 🚀 Scaling Considerations

### Horizontal Scaling

1. **Load Balancer**: Use nginx or cloud load balancer
2. **Session Storage**: Use Redis for session storage
3. **Database**: Use read replicas for read operations
4. **Caching**: Implement Redis caching layer

### Vertical Scaling

1. **Memory**: Increase Node.js memory limit
2. **CPU**: Use multi-core processors
3. **Database**: Optimize database configuration
4. **Storage**: Use SSD storage for better I/O

## 🔍 Troubleshooting

### Common Issues

1. **Memory Issues**

```bash
# Increase memory limit
node --max-old-space-size=4096 dist/index.js
```

2. **Database Connection Issues**

```bash
# Check database connection
npx prisma db pull
```

3. **Port Already in Use**

```bash
# Find process using port
lsof -ti:4000 | xargs kill -9
```

4. **Permission Issues**

```bash
# Fix file permissions
sudo chown -R $USER:$USER /path/to/app
```

### Debugging

```bash
# Enable debug logging
DEBUG=* npm start

# View detailed logs
pm2 logs crafely-ai --lines 100

# Monitor resources
htop
```

## 📚 Related Documentation

- [Architecture Overview](../architecture/overview.md)
- [Development Guide](../development/README.md)
- [API Reference](../api/README.md)
- [Database Schema](../architecture/database.md)
