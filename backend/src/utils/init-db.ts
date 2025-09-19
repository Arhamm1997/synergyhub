import mongoose from 'mongoose';
import { config } from '../config';
import { User } from '../models/user.model';
import { Project } from '../models/project.model';
import { Task } from '../models/task.model';
import { Client } from '../models/client.model';
import { Business } from '../models/business.model';
import { Message } from '../models/message.model';
import { Notification } from '../models/notification.model';
import { logger } from '../utils/logger';

async function initializeDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(config.mongoUri);
    logger.info('Connected to MongoDB');

    // Create indexes for all models
    logger.info('Creating indexes...');

    await Promise.all([
      User.createIndexes(),
      Project.createIndexes(),
      Task.createIndexes(),
      Client.createIndexes(),
      Business.createIndexes(),
      Message.createIndexes(),
      Notification.createIndexes()
    ]);

    logger.info('Database indexes created successfully');
    process.exit(0);
  } catch (error) {
    logger.error('Error initializing database:', error);
    process.exit(1);
  }
}

initializeDatabase();