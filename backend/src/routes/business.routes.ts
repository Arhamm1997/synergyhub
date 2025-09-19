import { Router } from 'express';
import { BusinessController } from '../controllers/business.controller';
import { auth } from '../middleware/auth';
import { validateRequest } from '../middleware/validate-request';
import { businessValidation } from '../validations/business.validation';

const router = Router();
const controller = new BusinessController();

// Create a new business
router.post(
  '/',
  auth,
  validateRequest(businessValidation.createBusiness),
  controller.createBusiness
);

// Get all businesses
router.get('/', auth, controller.getAllBusinesses);

// Get business by ID
router.get('/:id', auth, controller.getBusinessById);

// Update business
router.put(
  '/:id',
  auth,
  validateRequest(businessValidation.updateBusiness),
  controller.updateBusiness
);

// Delete business
router.delete('/:id', auth, controller.deleteBusiness);

// Add member to business
router.post(
  '/:id/members',
  auth,
  validateRequest(businessValidation.addMember),
  controller.addMember
);

// Remove member from business
router.delete(
  '/:id/members/:memberId',
  auth,
  controller.removeMember
);

export default router;