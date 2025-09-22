# Environment Setup Guide

This guide will help you set up your environment variables for running SynergyHub in production.

## Required Environment Variables

### Server Configuration
- `PORT`: The port number for the server (default: 5000)
- `NODE_ENV`: Environment mode (development/production)

### MongoDB Configuration
- `MONGODB_URI`: Your MongoDB connection string
  - Format: `mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<dbname>`
  - For local development: `mongodb://localhost:27017/synergyhub`

### JWT Configuration
- `JWT_SECRET`: A secure random string for JWT signing
  - Must be at least 32 characters
  - Use a secure random generator
- `JWT_EXPIRES_IN`: Token expiration time (e.g., '7d', '24h')

### SMTP Configuration
- `SMTP_HOST`: Your SMTP server host
- `SMTP_PORT`: SMTP port (usually 465 for SSL)
- `SMTP_USER`: Your SMTP username/email
- `SMTP_PASSWORD`: Your SMTP password or app-specific password
- `SMTP_FROM_EMAIL`: Default sender email
- `SMTP_FROM_NAME`: Default sender name

### Frontend URL
- `FRONTEND_URL`: Your frontend application URL
  - Production: `https://your-domain.com`
  - Development: `http://localhost:3000`

### Rate Limiting
- `RATE_LIMIT_WINDOW`: Time window in minutes
- `RATE_LIMIT_MAX_REQUESTS`: Max requests per window

### Business Quotas
- `DEFAULT_MAX_ADMINS`: Default max admin users per business
- `DEFAULT_MAX_MEMBERS`: Default max members per business

### File Upload (Optional)
- `AWS_ACCESS_KEY_ID`: AWS access key for S3
- `AWS_SECRET_ACCESS_KEY`: AWS secret key
- `AWS_REGION`: AWS region for S3
- `AWS_BUCKET_NAME`: S3 bucket name

### Logging
- `LOG_LEVEL`: Logging level (debug/info/warn/error)
- `LOG_FILE_PATH`: Path for log files

### Security
- `CORS_ORIGIN`: Allowed CORS origins
- `MAX_FILE_SIZE`: Maximum upload file size in bytes

## Setting Up Gmail SMTP

1. Enable 2-Step Verification in your Google Account
2. Generate an App Password:
   - Go to Google Account settings
   - Select "Security"
   - Under "2-Step Verification", click "App passwords"
   - Generate a new app password for "Mail"
3. Use this password in your `SMTP_PASSWORD`

## Production Security Notes

1. Use strong, unique values for all secrets
2. Never commit `.env` files to version control
3. Use different values for development and production
4. Regularly rotate sensitive credentials
5. Use secure HTTPS URLs in production
6. Configure proper CORS settings

## Example Production Values

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/synergyhub
JWT_SECRET=your-secure-random-string
FRONTEND_URL=https://your-domain.com
CORS_ORIGIN=https://your-domain.com
```