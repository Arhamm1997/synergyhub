import { Router } from 'express';
import { InvitationController } from '../controllers/invitation.controller';
import { auth } from '../middleware/auth';
import { validate } from '../middleware/validation.middleware';
import { invitationValidation } from '../validations/invitation.validation';

const router = Router();

// Protected routes (require authentication)
router.use(auth);

// Send invitation
router.post(
  '/send',
  validate(invitationValidation.sendInvitation),
  InvitationController.sendInvitation
);

// Resend invitation
router.post(
  '/:invitationId/resend',
  validate(invitationValidation.resendInvitation),
  InvitationController.resendInvitation
);

// Cancel invitation
router.delete(
  '/:invitationId',
  validate(invitationValidation.cancelInvitation),
  InvitationController.cancelInvitation
);

// Get business invitations
router.get(
  '/business/:businessId',
  validate(invitationValidation.getBusinessInvitations),
  InvitationController.getBusinessInvitations
);

// Validate invitation (public route)
router.get(
  '/validate',
  validate(invitationValidation.validateInvitation),
  InvitationController.validateInvitation
);

export default router;