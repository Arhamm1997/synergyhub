import { Router } from 'express';
import { membersController } from '../controllers/member.controller';
import { validate } from '../middleware/validation.middleware';
import { memberValidation } from '../validations/member.validation';
import { auth } from '../middleware/auth';
import { requireRole } from '../middleware/role-auth';
import { Role } from '../types/enums';

const router = Router();

router.use(auth); // All routes require authentication

// Get members for a business
router.get(
    '/business/:businessId/members',
    validate({
        params: memberValidation.params.businessId
    }),
    membersController.getBusinessMembers
);

// Add a member to a business
router.post(
    '/business/:businessId/members',
    requireRole([Role.SuperAdmin, Role.Admin]),
    validate({
        params: memberValidation.params.businessId,
        body: memberValidation.addBusinessMember
    }),
    membersController.addBusinessMember
);

// Update member's role in a business
router.patch(
    '/business/:businessId/members/:userId/role',
    requireRole([Role.SuperAdmin, Role.Admin]),
    validate({
        params: memberValidation.params.both,
        body: memberValidation.updateMemberRole
    }),
    membersController.updateBusinessMemberRole
);

// Remove a member from a business
router.delete(
    '/business/:businessId/members/:userId',
    requireRole([Role.SuperAdmin, Role.Admin]),
    validate({
        params: memberValidation.params.both
    }),
    membersController.removeBusinessMember
);

// Update member avatar
router.patch(
    '/members/:userId/avatar',
    validate({
        params: memberValidation.params.userId,
        body: memberValidation.updateMemberAvatar
    }),
    membersController.updateMemberAvatar
);

export default router;