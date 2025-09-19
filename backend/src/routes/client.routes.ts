import { Router } from 'express';
import { body } from 'express-validator';
import { clientController } from '../controllers/client.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';

const router = Router();

// Validation rules
const clientValidation = [
  body('name').trim().notEmpty().withMessage('Client name is required'),
  body('logoUrl').isURL().withMessage('Valid logo URL is required'),
  body('logoHint').trim().notEmpty().withMessage('Logo hint is required'),
  body('status')
    .isIn(['Lead', 'Active', 'On Hold', 'Completed', 'Cancelled'])
    .withMessage('Invalid status'),
  body('progress')
    .optional()
    .isInt({ min: 0, max: 100 })
    .withMessage('Progress must be between 0 and 100'),
  body('assignees')
    .isArray()
    .withMessage('Assignees must be an array')
    .custom((value) => value.every((id: string) => /^[0-9a-fA-F]{24}$/.test(id)))
    .withMessage('Invalid assignee IDs'),
  body('services')
    .optional()
    .isArray()
    .withMessage('Services must be an array'),
  body('contactInfo')
    .optional()
    .isObject()
    .withMessage('Contact info must be an object'),
  body('contactInfo.email')
    .optional()
    .isEmail()
    .withMessage('Invalid email address'),
  body('contactInfo.phone')
    .optional()
    .matches(/^\+?[\d\s-]+$/)
    .withMessage('Invalid phone number'),
  body('contactInfo.address').optional().trim()
];

// Apply authentication to all routes
router.use(authenticate);

// Routes
router.get('/', clientController.getClients);
router.get('/:id', clientController.getClient);
router.post(
  '/',
  authorize('Admin', 'Team Lead'),
  validate(clientValidation),
  clientController.createClient
);
router.put(
  '/:id',
  authorize('Admin', 'Team Lead'),
  validate(clientValidation),
  clientController.updateClient
);
router.delete(
  '/:id',
  authorize('Admin'),
  clientController.deleteClient
);

export default router;