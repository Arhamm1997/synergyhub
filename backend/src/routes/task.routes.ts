import { Router } from 'express';
import { body, query } from 'express-validator';
import { taskController } from '../controllers/task.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';

const router = Router();

// Validation rules
const taskValidation = [
  body('title').trim().notEmpty().withMessage('Task title is required'),
  body('project')
    .isMongoId()
    .withMessage('Valid project ID is required'),
  body('assignee')
    .isMongoId()
    .withMessage('Valid assignee ID is required'),
  body('priority')
    .isIn(['Urgent', 'High', 'Medium', 'Low', 'None'])
    .withMessage('Invalid priority level'),
  body('status')
    .isIn(['Backlog', 'Todo', 'In Progress', 'In Review', 'Done', 'Cancelled'])
    .withMessage('Invalid status'),
  body('dueDate')
    .isISO8601()
    .withMessage('Valid due date is required'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters'),
  body('attachments')
    .optional()
    .isArray()
    .withMessage('Attachments must be an array')
];

const queryValidation = [
  query('assignee')
    .optional()
    .isMongoId()
    .withMessage('Invalid assignee ID')
];

// Apply authentication to all routes
router.use(authenticate);

// Routes
router.get('/', validate(queryValidation), taskController.getTasks);
router.get('/:id', taskController.getTask);
router.post(
  '/',
  authorize('Admin', 'Team Lead', 'Employee'),
  validate(taskValidation),
  taskController.createTask
);
router.put(
  '/:id',
  authorize('Admin', 'Team Lead', 'Employee'),
  validate(taskValidation),
  taskController.updateTask
);
router.delete(
  '/:id',
  authorize('Admin', 'Team Lead'),
  taskController.deleteTask
);

export default router;