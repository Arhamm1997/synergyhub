import { Router } from 'express';
import { notificationController } from '../controllers/notification.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validate-request';
import { notificationValidation } from '../validations/notification.validation';

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
  validateRequest(notificationValidation.prioritizeNotifications),
  notificationController.prioritizeNotifications
);

export default router;