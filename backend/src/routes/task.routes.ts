import { Router } from 'express';
import { taskController } from '../controllers/task.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { taskValidation } from '../validations/task.validation';

const router = Router();

// Apply authentication to all routes
router.use(authenticate);

// Basic CRUD routes
router.get('/', validate(taskValidation.queryTasks), taskController.getTasks);
router.get('/analytics', taskController.getTaskAnalytics);
router.get('/:id', taskController.getTask);
router.post(
  '/',
  authorize('Admin', 'SuperAdmin', 'Member'),
  validate(taskValidation.createTask),
  taskController.createTask
);
router.put(
  '/:id',
  authorize('Admin', 'SuperAdmin', 'Member'),
  validate(taskValidation.updateTask),
  taskController.updateTask
);
router.delete(
  '/:id',
  authorize('Admin', 'SuperAdmin'),
  taskController.deleteTask
);

// Enhanced features
router.post(
  '/:id/comments',
  validate(taskValidation.addComment),
  taskController.addComment
);
router.post(
  '/:id/time',
  validate(taskValidation.addTimeEntry),
  taskController.addTimeEntry
);
router.post(
  '/:id/watchers/toggle',
  taskController.toggleWatcher
);

export default router;