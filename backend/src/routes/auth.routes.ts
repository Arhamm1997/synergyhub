import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { authValidation } from '../validations/auth.validation';

const router = Router();

// Routes
router.post('/register', validate(authValidation.register), authController.register);
router.post('/login', validate(authValidation.login), authController.login);
router.get('/me', authenticate, authController.me);
router.post('/logout', authenticate, authController.logout);

export default router;