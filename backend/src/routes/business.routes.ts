import { Router } from 'express';
import { BusinessController } from '../controllers/business.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { businessValidation } from '../validations/business.validation';

const router = Router();
const controller = new BusinessController();

// Create a new business
router.post(
  '/',
  authenticate,
  validate(businessValidation.createBusiness),
  controller.createBusiness
);

// Get all businesses
router.get('/', authenticate, controller.getAllBusinesses);

// More specific routes FIRST (before generic /:businessId)
router.get('/:businessId/member-quotas', 
  authenticate,
  (req, res, next) => {
    // Log the request for debugging
    console.log('Member quotas request:', {
      businessId: req.params.businessId,
      user: req.user?._id
    });
    next();
  },
  controller.getMemberQuotas
);

// Generic routes AFTER specific ones
router.get('/:businessId', authenticate, controller.getBusinessById);

// Update business
router.put(
  '/:id',
  authenticate,
  validate(businessValidation.updateBusiness),
  controller.updateBusiness
);

// Delete business
router.delete('/:id', authenticate, controller.deleteBusiness);

// Add member to business
router.post(
  '/:id/members',
  authenticate,
  validate(businessValidation.addMember),
  controller.addMember
);

// Remove member from business
router.delete(
  '/:id/members/:memberId',
  authenticate,
  controller.removeMember
);

export default router;