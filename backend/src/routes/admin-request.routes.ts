import express from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validate-request';
import { authController } from '../controllers/auth.controller';

const router = express.Router();

// Admin request processing
router.post(
  '/admin-requests/:requestId',
  authMiddleware,
  authController.processAdminRequest
);

// Get admin requests
router.get(
  '/admin-requests',
  authMiddleware,
  authController.getAdminRequests
);

export const adminRequestRoutes = router;