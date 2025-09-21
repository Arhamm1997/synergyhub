import { Router } from 'express';
import { taskController } from '../controllers/task.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { taskValidation } from '../validations/task.validation';

const router = Router();

// Apply authentication to all routes
router.use(authenticate);

// Routes
router.get('/', validate(taskValidation.queryTasks), taskController.getTasks);
router.get('/:id', taskController.getTask);
router.post(
  '/',
  authorize('Admin', 'Team Lead', 'Employee'),
  validate(taskValidation.createTask),
  taskController.createTask
);
router.put(
  '/:id',
  authorize('Admin', 'Team Lead', 'Employee'),
  validate(taskValidation.updateTask),
  taskController.updateTask
);
router.delete(
  '/:id',
  authorize('Admin', 'Team Lead'),
  taskController.deleteTask
);

export default router;