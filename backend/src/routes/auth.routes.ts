import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { authValidation } from '../validations/auth.validation';

const router = Router();

// Routes
router.get('/check-first-user', authController.checkFirstUser);
router.post('/signup', validate(authValidation.register), authController.register);
router.post('/register', validate(authValidation.register), authController.register); // Keep for backward compatibility
router.post('/login', validate(authValidation.login), authController.login);
router.get('/me', authenticate, authController.me);
router.post('/logout', authenticate, authController.logout);
router.get('/admin-stats', authenticate, authController.getAdminStats);

// Admin request routes
router.get('/admin-requests', authenticate, authController.getAdminRequests);
router.post('/admin-requests/:requestId', authenticate, authController.processAdminRequest);

export default router;