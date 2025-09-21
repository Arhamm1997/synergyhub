import { Router } from 'express';
import { projectController } from '../controllers/project.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { projectValidation } from '../validations/project.validation';

const router = Router();

// Apply authentication to all routes
router.use(authenticate);

// Routes
router.get('/', projectController.getProjects);
router.get('/:id', projectController.getProject);
router.post(
  '/',
  authorize('Admin', 'Team Lead'),
  validate(projectValidation.createProject),
  projectController.createProject
);
router.put(
  '/:id',
  authorize('Admin', 'Team Lead'),
  validate(projectValidation.updateProject),
  projectController.updateProject
);
router.delete(
  '/:id',
  authorize('Admin'),
  projectController.deleteProject
);
router.get('/:id/tasks', projectController.getProjectTasks);

export default router;