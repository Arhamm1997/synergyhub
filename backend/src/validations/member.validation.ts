import { z } from 'zod';
import { Role } from '../types/enums';

const paramsSchema = z.object({
    userId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ID format'),
    businessId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ID format')
});

export const memberValidation = {
    addBusinessMember: z.object({
        userId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid user ID'),
        role: z.nativeEnum(Role)
    }),

    updateMemberRole: z.object({
        role: z.nativeEnum(Role)
    }),

    updateMemberAvatar: z.object({
        avatarUrl: z.string().url('Invalid avatar URL'),
        avatarHint: z.string().optional()
    }),

    // Common parameter validation schemas
    params: {
        userId: paramsSchema.pick({ userId: true }),
        businessId: paramsSchema.pick({ businessId: true }),
        both: paramsSchema
    }
};