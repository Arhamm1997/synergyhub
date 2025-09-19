import { Express } from 'express';
import authRoutes from './auth.routes';
import projectRoutes from './project.routes';
import taskRoutes from './task.routes';
import clientRoutes from './client.routes';
import businessRoutes from './business.routes';
import messageRoutes from './message.routes';
import notificationRoutes from './notification.routes';
import uploadRoutes from './upload.routes';

export const setupRoutes = (app: Express) => {
  // API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/projects', projectRoutes);
  app.use('/api/tasks', taskRoutes);
  app.use('/api/clients', clientRoutes);
  app.use('/api/businesses', businessRoutes);
  app.use('/api/messages', messageRoutes);
  app.use('/api/notifications', notificationRoutes);
  app.use('/api/upload', uploadRoutes);

  // Health check
  app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });
};