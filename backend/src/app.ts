import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { createServer } from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import { rateLimit } from 'express-rate-limit';
import { config } from './config';
import { errorHandler } from './middleware/error-handler';
import { setupRoutes } from './routes';
import { logger } from './utils/logger';
import { setupSocketHandlers } from './services/socket.service';
import { setupProcessHandlers } from './utils/process-handler';

// Create Express app
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: config.corsOrigin,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["content-type", "authorization"]
  },
  transports: ['websocket', 'polling'],
  allowEIO3: true,
  pingTimeout: 60000
});

// Middleware
app.use(cors({
  origin: config.corsOrigin,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimitWindow * 60 * 1000,
  max: config.rateLimitMaxRequests,
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Root route handler
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'SynergyHub API Server',
    version: '1.0.0'
  });
});

// Setup routes
setupRoutes(app);

// Error handling
app.use(errorHandler);

// Connect to MongoDB
mongoose.connect(config.mongoUri)
  .then(() => logger.info('Connected to MongoDB'))
  .catch((error) => {
    logger.error('MongoDB connection error:', error);
    process.exit(1);
  });

// Setup WebSocket handlers
setupSocketHandlers(io);

// Setup process handlers for graceful shutdown
setupProcessHandlers(httpServer);

// Start server
const PORT = config.port;
const startServer = () => {
  try {
    httpServer.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT}`);
    });

    // Handle server-specific errors
    httpServer.on('error', (error: any) => {
      if (error.code === 'EADDRINUSE') {
        logger.error(`Port ${PORT} is already in use`);
        logger.info('Attempting to retry in 5 seconds...');
        setTimeout(() => {
          httpServer.close();
          startServer();
        }, 5000);
      } else {
        logger.error('Server error:', error);
      }
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export { app, httpServer };