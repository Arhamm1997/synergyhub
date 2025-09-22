import { Server } from 'http';
import { logger } from './logger';
import mongoose from 'mongoose';

export const setupProcessHandlers = (server: Server) => {
  // Increase max listeners limit for process events
  process.setMaxListeners(15);  // Increasing from default 10 to 15

  const shutdown = async (signal: string) => {
    logger.info(`Received ${signal}. Starting graceful shutdown...`);

    // Close HTTP server
    server.close(() => {
      logger.info('HTTP server closed.');
    });

    try {
      // Close MongoDB connection
      await mongoose.connection.close();
      logger.info('MongoDB connection closed.');

      // Exit process
      process.exit(0);
    } catch (error) {
      logger.error('Error during shutdown:', error);
      process.exit(1);
    }
  };

  // Handle process signals
  const signals = ['SIGTERM', 'SIGINT', 'SIGUSR2'];
  signals.forEach(signal => {
    // Remove any existing listeners for this signal
    process.removeAllListeners(signal);

    // Add new listener
    process.once(signal, () => shutdown(signal));
  });

  // Handle uncaught exceptions and unhandled rejections
  process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception:', error);
    shutdown('UNCAUGHT_EXCEPTION');
  });

  process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
    shutdown('UNHANDLED_REJECTION');
  });
};