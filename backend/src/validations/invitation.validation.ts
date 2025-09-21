import { z } from 'zod';
import { Role, Department } from '../types/enums';

const sendInvitationSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  role: z.nativeEnum(Role),
  businessId: z.string(),
  department: z.nativeEnum(Department),
  designation: z.string().optional(),
  phoneNumber: z.string().optional(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  avatarUrl: z.string().optional(),
  avatarHint: z.string().optional(),
});

export const invitationValidation = {
  sendInvitation: {
    body: sendInvitationSchema
  },
  resendInvitation: {
    params: z.object({
      invitationId: z.string().min(1, 'Invitation ID is required')
    })
  },

  cancelInvitation: {
    params: z.object({
      invitationId: z.string().min(1, 'Invitation ID is required')
    })
  },

  getBusinessInvitations: {
    params: z.object({
      businessId: z.string().min(1, 'Business ID is required')
    })
  },

  validateInvitation: {
    query: z.object({
      token: z.string().min(1, 'Token is required')
    })
  },
};