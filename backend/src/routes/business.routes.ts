import { Router } from 'express';
import { businessController } from '../controllers/business.controller';
import { validate } from '../middleware/validation.middleware';
import { businessValidation } from '../validations/business.validation';
import { auth } from '../middleware/auth';
import { requireRole } from '../middleware/role-auth';
import { Role } from '../types/enums';

const router = Router();

router.use(auth); // All routes require authentication

// Create a new business
router.post(
  '/',
  validate({
    body: businessValidation.createBusiness.body
  }),
  businessController.createBusiness
);

// Get all businesses for current user
router.get('/', businessController.getBusinesses);

// Get member quotas for a business (must come before generic /:businessId)
router.get(
  '/:businessId/quotas',
  validate({
    params: businessValidation.getBusiness.params
  }),
  businessController.getMemberQuotas
);

// Get business analytics
router.get(
  '/:id/analytics',
  businessController.getBusinessAnalytics
);

// Get a specific business
router.get(
  '/:businessId',
  validate({
    params: businessValidation.getBusiness.params
  }),
  businessController.getBusiness
);

// Update a business
router.patch(
  '/:id',
  validate({
    body: businessValidation.updateBusiness.body
  }),
  businessController.updateBusiness
);

// Invite member to business
router.post(
  '/:id/invite',
  businessController.inviteMember
);

// Update member role
router.patch(
  '/:id/members/:memberId/role',
  businessController.updateMemberRole
);

// Remove member from business
router.delete(
  '/:id/members/:memberId',
  businessController.removeMember
);

// Delete a business
router.delete(
  '/:id',
  requireRole([Role.SuperAdmin]),
  businessController.deleteBusiness
);

export default router;