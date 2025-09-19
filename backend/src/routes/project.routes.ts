import { Router } from 'express';
import { body } from 'express-validator';
import { projectController } from '../controllers/project.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';

const router = Router();

// Validation rules
const projectValidation = [
  body('name').trim().notEmpty().withMessage('Project name is required'),
  body('client')
    .isMongoId()
    .withMessage('Valid client ID is required'),
  body('status')
    .isIn(['Not Started', 'In Progress', 'On Hold', 'Completed', 'Cancelled'])
    .withMessage('Invalid status'),
  body('progress')
    .isInt({ min: 0, max: 100 })
    .withMessage('Progress must be between 0 and 100'),
  body('deadline')
    .isISO8601()
    .withMessage('Valid deadline date is required'),
  body('team')
    .isArray()
    .withMessage('Team must be an array')
    .custom((value) => value.every((id: string) => /^[0-9a-fA-F]{24}$/.test(id)))
    .withMessage('Invalid team member IDs'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters')
];

// Apply authentication to all routes
router.use(authenticate);

// Routes
router.get('/', projectController.getProjects);
router.get('/:id', projectController.getProject);
router.post(
  '/',
  authorize('Admin', 'Team Lead'),
  validate(projectValidation),
  projectController.createProject
);
router.put(
  '/:id',
  authorize('Admin', 'Team Lead'),
  validate(projectValidation),
  projectController.updateProject
);
router.delete(
  '/:id',
  authorize('Admin'),
  projectController.deleteProject
);
router.get('/:id/tasks', projectController.getProjectTasks);

export default router;