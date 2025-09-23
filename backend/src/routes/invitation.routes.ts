import { Router } from 'express';
import { InvitationController } from '../controllers/invitation.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { invitationValidation } from '../validations/invitation.validation';
import { requireRole, validateRoleManagement } from '../middleware/role-auth';
import { Role } from '../types/enums';

const router = Router();

// Public routes (no authentication required)
// Validate invitation (public route) - MUST be before authenticate middleware
router.get(
  '/validate',
  validate(invitationValidation.validateInvitation),
  InvitationController.validateInvitation
);

// Protected routes (require authentication)
router.use(authenticate);

// Send invitation - only SuperAdmin can invite admins, both SuperAdmin and Admin can invite members
router.post(
  '/send',
  requireRole([Role.SuperAdmin, Role.Admin]),
  validate(invitationValidation.sendInvitation),
  validateRoleManagement,
  InvitationController.sendInvitation
);

// Resend invitation - only the original sender or a SuperAdmin can resend
router.post(
  '/:invitationId/resend',
  requireRole([Role.SuperAdmin, Role.Admin]),
  validate(invitationValidation.resendInvitation),
  validateRoleManagement,
  InvitationController.resendInvitation
);

// Cancel invitation - only the original sender or a SuperAdmin can cancel
router.delete(
  '/:invitationId',
  requireRole([Role.SuperAdmin, Role.Admin]),
  validate(invitationValidation.cancelInvitation),
  validateRoleManagement,
  InvitationController.cancelInvitation
);

// Get business invitations - SuperAdmin sees all, Admin sees their own invitations
router.get(
  '/business/:businessId',
  requireRole([Role.SuperAdmin, Role.Admin]),
  validate(invitationValidation.getBusinessInvitations),
  InvitationController.getBusinessInvitations
);

// Get all invitations for current user's business
router.get(
  '/',
  requireRole([Role.SuperAdmin, Role.Admin]),
  InvitationController.getBusinessInvitations
);

export default router;