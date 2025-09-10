# Frequently Asked Questions

This document answers common questions about the Crafely AI Node application.

## 🚀 Getting Started

### Q: How do I set up the development environment?

A: Follow the [Getting Started Guide](./getting-started.md) for detailed setup instructions. The basic steps are:

1. Clone the repository
2. Install dependencies with `npm install`
3. Set up environment variables
4. Run database migrations with `npx prisma migrate dev`
5. Start the development server with `npm run serve`

### Q: What are the system requirements?

A: The application requires:

- Node.js 18 or higher
- PostgreSQL 13 or higher
- npm 8 or higher
- At least 2GB RAM
- 1GB free disk space

### Q: How do I get API keys for external services?

A: You'll need to sign up for accounts with:

- **OpenAI**: Get API key from [OpenAI Platform](https://platform.openai.com/)
- **Clerk**: Get keys from [Clerk Dashboard](https://dashboard.clerk.com/)
- **Replicate**: Get token from [Replicate](https://replicate.com/)
- **PostgreSQL**: Use a cloud provider like [Supabase](https://supabase.com/) or [Railway](https://railway.app/)

## 🔧 Development

### Q: How do I add a new API endpoint?

A: Follow these steps:

1. Create a new route in `src/routes/`
2. Add the route to the main router in `src/routes/index.ts`
3. Create a controller in `src/controllers/`
4. Create a service in `src/services/` if needed
5. Add validation in `src/validator/`
6. Update the API documentation

### Q: How do I add a new database model?

A: Follow these steps:

1. Add the model to `prisma/schema.prisma`
2. Run `npx prisma migrate dev --name add_new_model`
3. Run `npx prisma generate`
4. Update the service layer to use the new model
5. Update the API documentation

### Q: How do I test the application?

A: Currently, the application doesn't have automated tests. To test manually:

1. Start the development server
2. Use tools like Postman or curl to test endpoints
3. Check the browser console for errors
4. Monitor the server logs

### Q: How do I debug issues?

A: Use these debugging techniques:

1. **Console Logging**: Add `console.log()` statements
2. **Debug Mode**: Run with `DEBUG=* npm start`
3. **PM2 Logs**: Use `pm2 logs` for production
4. **Database**: Use `npx prisma studio` to inspect data
5. **Network**: Use browser dev tools to inspect requests

## 🗄️ Database

### Q: How do I reset the database?

A: Use these commands:

```bash
# Development reset (loses all data)
npx prisma migrate reset

# Production reset (be careful!)
npx prisma migrate reset --force
```

### Q: How do I backup the database?

A: Use these commands:

```bash
# Create backup
pg_dump -h localhost -U username -d crafely_ai > backup.sql

# Restore backup
psql -h localhost -U username -d crafely_ai < backup.sql
```

### Q: How do I add a new field to an existing model?

A: Follow these steps:

1. Add the field to the model in `prisma/schema.prisma`
2. Run `npx prisma migrate dev --name add_field_name`
3. Update the service layer to handle the new field
4. Update the API documentation

### Q: How do I handle database migrations in production?

A: Follow these steps:

1. Test migrations in development first
2. Create a backup of the production database
3. Run `npx prisma migrate deploy` in production
4. Monitor the application for issues
5. Rollback if necessary

## 🔐 Authentication

### Q: How do I create an API key?

A: Use the admin API endpoint:

```bash
curl -X POST https://your-domain.com/api/v1/admin/api-key \
  -H "Authorization: Bearer your_jwt_token" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My API Key",
    "permissions": ["chat", "image"]
  }'
```

### Q: How do I validate an API key?

A: The API key validation is handled automatically by the middleware. Include the key in the Authorization header:

```bash
curl -X GET https://your-domain.com/api/v1/chat/messages \
  -H "Authorization: Bearer your_api_key"
```

### Q: How do I revoke an API key?

A: Use the admin API endpoint:

```bash
curl -X DELETE https://your-domain.com/api/v1/admin/api-key/key_id \
  -H "Authorization: Bearer your_jwt_token"
```

## 🤖 AI Integration

### Q: How do I change the OpenAI model?

A: Update the environment variable:

```env
OPENAI_MODEL=gpt-4-turbo
```

Then restart the application.

### Q: How do I add a new AI provider?

A: Follow these steps:

1. Create a new service in `src/services/`
2. Implement the required methods
3. Update the chat service to use the new provider
4. Add configuration options
5. Update the API documentation

### Q: How do I monitor AI usage and costs?

A: Use the usage tracking endpoints:

```bash
# Get usage statistics
curl -X GET https://your-domain.com/api/v1/usage \
  -H "Authorization: Bearer your_api_key"

# Get detailed analytics (admin only)
curl -X GET https://your-domain.com/api/v1/admin/usage \
  -H "Authorization: Bearer your_jwt_token"
```

## 🚀 Deployment

### Q: How do I deploy to Vercel?

A: Follow the [Vercel Deployment Guide](../deployment/README.md#vercel-deployment):

1. Install Vercel CLI
2. Run `vercel` to deploy
3. Set environment variables
4. Deploy to production with `vercel --prod`

### Q: How do I deploy to Railway?

A: Follow the [Railway Deployment Guide](../deployment/README.md#railway-deployment):

1. Install Railway CLI
2. Run `railway init`
3. Add PostgreSQL database
4. Set environment variables
5. Run `railway up`

### Q: How do I deploy with Docker?

A: Follow the [Docker Deployment Guide](../deployment/README.md#docker-deployment):

1. Create Dockerfile
2. Create docker-compose.yml
3. Run `docker-compose up -d`
4. Run database migrations

### Q: How do I scale the application?

A: Consider these scaling options:

1. **Horizontal Scaling**: Use load balancer with multiple instances
2. **Database Scaling**: Use read replicas for read operations
3. **Caching**: Implement Redis for caching
4. **CDN**: Use CDN for static assets

## 🔧 Troubleshooting

### Q: The application won't start. What should I do?

A: Check these common issues:

1. **Port in use**: Change the port or kill the process using it
2. **Missing environment variables**: Check your `.env` file
3. **Database connection**: Verify your `DATABASE_URL`
4. **Dependencies**: Run `npm install` again
5. **Node version**: Ensure you're using Node.js 18+

### Q: I'm getting database connection errors. What should I do?

A: Try these solutions:

1. **Check database URL**: Verify the connection string
2. **Test connection**: Use `npx prisma db pull`
3. **Check database status**: Ensure PostgreSQL is running
4. **Check credentials**: Verify username and password
5. **Check network**: Ensure database is accessible

### Q: API requests are failing. What should I do?

A: Check these common issues:

1. **Authentication**: Verify API key or JWT token
2. **Rate limiting**: Check if you've exceeded rate limits
3. **Request format**: Verify request body and headers
4. **Server logs**: Check application logs for errors
5. **Network**: Test with curl or Postman

### Q: The application is slow. How can I optimize it?

A: Try these optimizations:

1. **Database**: Add indexes, optimize queries
2. **Caching**: Implement Redis caching
3. **Memory**: Increase Node.js memory limit
4. **Connection pooling**: Configure database connection pool
5. **CDN**: Use CDN for static assets

## 📊 Monitoring

### Q: How do I monitor the application?

A: Use these monitoring tools:

1. **PM2**: For process monitoring
2. **Logs**: Check application logs
3. **Health checks**: Use `/health` endpoint
4. **Database**: Monitor database performance
5. **External services**: Monitor API usage

### Q: How do I set up logging?

A: The application uses console logging by default. For production:

1. **PM2**: Use PM2 for log management
2. **Logrotate**: Set up log rotation
3. **External services**: Use services like Sentry
4. **Structured logging**: Implement structured logging

## 🔒 Security

### Q: How do I secure the application?

A: Follow these security practices:

1. **Environment variables**: Never commit secrets
2. **HTTPS**: Use SSL/TLS in production
3. **Rate limiting**: Implement rate limiting
4. **Input validation**: Validate all inputs
5. **Authentication**: Use strong authentication
6. **Updates**: Keep dependencies updated

### Q: How do I handle sensitive data?

A: Follow these practices:

1. **Encryption**: Encrypt sensitive data at rest
2. **Environment variables**: Use environment variables for secrets
3. **Database**: Use database encryption
4. **API keys**: Hash API keys before storage
5. **Logs**: Don't log sensitive information

## 📚 Additional Resources

### Q: Where can I find more documentation?

A: Check these resources:

1. **Project README**: Main project documentation
2. **API Reference**: Complete API documentation
3. **Architecture Docs**: System architecture overview
4. **Development Guide**: Development standards and practices
5. **Deployment Guide**: Deployment instructions

### Q: How do I contribute to the project?

A: Follow these steps:

1. **Fork the repository**
2. **Create a feature branch**
3. **Make your changes**
4. **Write tests** (when available)
5. **Update documentation**
6. **Submit a pull request**

### Q: How do I report bugs?

A: Use these methods:

1. **GitHub Issues**: Create an issue on GitHub
2. **Email**: Contact the development team
3. **Discord**: Join the community Discord
4. **Documentation**: Check if it's a known issue

### Q: How do I request features?

A: Use these methods:

1. **GitHub Issues**: Create a feature request
2. **Discussions**: Use GitHub Discussions
3. **Email**: Contact the development team
4. **Community**: Discuss with the community

## 🆘 Getting Help

### Q: I still need help. Where can I get support?

A: Try these support channels:

1. **Documentation**: Check all documentation first
2. **GitHub Issues**: Search existing issues
3. **Community**: Join the community Discord
4. **Email**: Contact support directly
5. **Stack Overflow**: Ask questions on Stack Overflow

### Q: How do I contact the development team?

A: Use these contact methods:

1. **Email**: support@crafely.com
2. **GitHub**: Create an issue or discussion
3. **Discord**: Join the community server
4. **Twitter**: Follow @crafely_ai

Remember to provide detailed information about your issue, including:

- Error messages
- Steps to reproduce
- Environment details
- Expected vs actual behavior
