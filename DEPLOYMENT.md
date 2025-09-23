# Deployment Guide

## Frontend Deployment (Vercel)

1. Push your code to GitHub
2. Log in to Vercel and create a new project
3. Import your GitHub repository
4. Configure environment variables:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend-url.onrender.com
   ```
5. Deploy your application

## Backend Deployment (Render)

1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Configure the service:
   - Name: synergyhub-api
   - Environment: Node
   - Build Command: `cd backend && npm install && npm run build`
   - Start Command: `cd backend && npm start`
   - Branch: main

4. Add Environment Variables:
   ```
   NODE_ENV=production
   PORT=5000
   MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/synergyhub
   JWT_SECRET=<your-secure-jwt-secret>
   FRONTEND_URL=https://your-frontend-url.vercel.app
   CORS_ORIGIN=https://your-frontend-url.vercel.app
   
   # AWS S3 Configuration
   AWS_ACCESS_KEY_ID=your_access_key
   AWS_SECRET_ACCESS_KEY=your_secret_key
   AWS_REGION=your_bucket_region
   AWS_BUCKET_NAME=your_bucket_name
   
   # SMTP Configuration
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASSWORD=your-app-specific-password
   
   # Rate Limiting
   RATE_LIMIT_WINDOW=15
   RATE_LIMIT_MAX_REQUESTS=100
   ```

## MongoDB Atlas Setup

1. Create a MongoDB Atlas account if you haven't already
2. Create a new cluster
3. Set up database access:
   - Create a database user
   - Use a strong password
   - Restrict access to specific IP addresses or allow access from anywhere (0.0.0.0/0)

4. Get your connection string:
   - Go to Clusters > Connect
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<username>`, `<password>`, and `<dbname>` with your values

5. Security recommendations:
   - Enable network access restrictions
   - Use strong passwords
   - Enable database auditing
   - Regular backups (Atlas M10+ clusters)

6. Performance optimization:
   - Choose the region closest to your Render deployment
   - Set up database indexes (already configured in initializeDatabase)
   - Monitor performance with Atlas metrics

## Database Collections

Your MongoDB database includes the following collections:

1. `users`
   - User accounts and authentication
   - Profile information
   - Roles and permissions

2. `businesses`
   - Business/organization details
   - Team configuration
   - Business settings

3. `projects`
   - Project information
   - Team assignments
   - Project status and metadata

4. `tasks`
   - Task details
   - Assignments
   - Status tracking
   - Dependencies

5. `clients`
   - Client information
   - Client organization details
   - Contact information

6. `messages`
   - Chat messages
   - Message threads
   - Attachments

7. `notifications`
   - User notifications
   - System alerts
   - Event notifications

8. `invitations`
   - Team invites
   - Client invitations
   - Invitation tracking

## Monitoring and Maintenance

1. Set up MongoDB Atlas monitoring:
   - Performance metrics
   - Slow query logs
   - Database alerts

2. Configure Render monitoring:
   - CPU and memory usage
   - Request logs
   - Error tracking

3. Regular maintenance tasks:
   - Database backups
   - Index optimization
   - Log rotation
   - Security updates

## Scaling Considerations

1. MongoDB Atlas:
   - Start with M0 (free) or M2/M5 (shared) for development
   - Upgrade to M10+ dedicated clusters for production
   - Enable auto-scaling if needed

2. Render:
   - Start with standard instance
   - Scale vertically (CPU/RAM) as needed
   - Enable auto-scaling for high availability

3. Performance optimizations:
   - Implement caching strategies
   - Use database indexes effectively
   - Optimize queries and aggregations
   - Implement connection pooling

## Backup and Recovery

1. MongoDB Atlas backups:
   - Automated snapshots (M10+ clusters)
   - Manual backup options
   - Point-in-time recovery

2. Render deployment:
   - Use GitHub for code versioning
   - Enable automatic deploys
   - Configure rollback options

Remember to regularly monitor your application's performance and scale resources as needed. Keep your environment variables secure and regularly rotate sensitive credentials.