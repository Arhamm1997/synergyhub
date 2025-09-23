import express from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { authController } from '../controllers/auth.controller';

const router = express.Router();

// Admin request processing
router.post(
  '/admin-requests/:requestId',
  authenticate,
  authController.processAdminRequest
);

// Get admin requests
router.get(
  '/admin-requests',
  authenticate,
  authController.getAdminRequests
);

export const adminRequestRoutes = router;