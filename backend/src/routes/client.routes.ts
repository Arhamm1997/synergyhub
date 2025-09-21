import { Router } from 'express';
import { clientController } from '../controllers/client.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { clientValidation } from '../validations/client.validation';

const router = Router();

// Apply authentication to all routes
router.use(authenticate);

// Routes
router.get('/', clientController.getClients);
router.get('/:id', clientController.getClient);
router.post(
  '/',
  authorize('Admin', 'Team Lead'),
  validate(clientValidation.createClient),
  clientController.createClient
);
router.put(
  '/:id',
  authorize('Admin', 'Team Lead'),
  validate(clientValidation.updateClient),
  clientController.updateClient
);
router.delete(
  '/:id',
  authorize('Admin'),
  clientController.deleteClient
);

export default router;