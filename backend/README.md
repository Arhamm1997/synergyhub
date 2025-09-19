# SynergyHub Backend

This is the backend server for SynergyHub, a team management application built with Node.js, Express, and MongoDB.

## Features

- 🔐 JWT Authentication
- 📝 Complete CRUD operations for Projects, Tasks, Clients, etc.
- 🔄 Real-time updates with Socket.IO
- 📧 Email notifications
- 🤖 AI-powered notification prioritization
- 📁 File upload support
- 📝 Comprehensive API documentation
- ✅ Input validation
- 🔒 Role-based access control

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn
- Google AI API key (for notification prioritization)
- SMTP server credentials

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/synergyhub.git
   cd synergyhub/backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a .env file:
   ```bash
   cp .env.example .env
   ```

4. Update the environment variables in `.env` with your configuration.

5. Create required directories:
   ```bash
   mkdir uploads logs
   ```

## Development

Start the development server:
```bash
npm run dev
```

The server will start on http://localhost:5000 by default.

## API Routes

### Authentication
- POST /api/auth/register - Register new user
- POST /api/auth/login - Login user
- POST /api/auth/logout - Logout user
- GET /api/auth/me - Get current user

### Projects
- GET /api/projects - Get all projects
- POST /api/projects - Create project
- GET /api/projects/:id - Get project
- PUT /api/projects/:id - Update project
- DELETE /api/projects/:id - Delete project
- GET /api/projects/:id/tasks - Get project tasks

### Tasks
- GET /api/tasks - Get all tasks
- POST /api/tasks - Create task
- GET /api/tasks/:id - Get task
- PUT /api/tasks/:id - Update task
- DELETE /api/tasks/:id - Delete task

### Clients
- GET /api/clients - Get all clients
- POST /api/clients - Create client
- GET /api/clients/:id - Get client
- PUT /api/clients/:id - Update client
- DELETE /api/clients/:id - Delete client

### File Upload
- POST /api/upload/avatar - Upload user avatar
- POST /api/upload/files - Upload multiple files

## Testing

Run tests:
```bash
npm test
```

## Production

Build for production:
```bash
npm run build
```

Start production server:
```bash
npm start
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| PORT | Server port | 5000 |
| NODE_ENV | Environment | development |
| MONGODB_URI | MongoDB connection string | mongodb://localhost:27017/synergyhub |
| JWT_SECRET | JWT secret key | your-jwt-secret |
| JWT_EXPIRES_IN | JWT expiration | 7d |
| CORS_ORIGIN | Allowed CORS origin | http://localhost:3000 |
| SMTP_HOST | SMTP server host | smtp.gmail.com |
| SMTP_PORT | SMTP server port | 587 |
| GOOGLE_AI_API_KEY | Google AI API key | - |

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License.