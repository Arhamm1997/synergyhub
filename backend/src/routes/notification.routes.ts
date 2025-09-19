import { Router } from 'express';
import { body } from 'express-validator';
import { notificationController } from '../controllers/notification.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';

const router = Router();

// Apply authentication to all routes
router.use(authenticate);

// Routes
router.get('/', notificationController.getNotifications);
router.put('/:id/read', notificationController.markAsRead);
router.put('/read-all', notificationController.markAllAsRead);
router.delete('/:id', notificationController.deleteNotification);
router.post(
  '/prioritize',
  body('notifications').isArray().withMessage('Notifications must be an array'),
  validate([body('notifications').isArray().withMessage('Notifications must be an array')]),
  notificationController.prioritizeNotifications
);

export default router;