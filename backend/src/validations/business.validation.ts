import { z } from 'zod';
import { Role } from '../types/enums';

export const businessValidation = {
  createBusiness: {
    body: z.object({
      name: z.string().min(2, 'Business name must be at least 2 characters').max(100),
      description: z.string().min(10, 'Description must be at least 10 characters').max(1000),
      type: z.string().optional(),
      phone: z.string().optional(),
      notes: z.string().optional()
    })
  },

  updateBusiness: {
    params: z.object({
      businessId: z.string().min(1, 'Business ID is required')
    }),
    body: z.object({
      name: z.string().min(2).max(100).optional(),
      description: z.string().min(10).max(1000).optional(),
      type: z.string().optional(),
      phone: z.string().optional(),
      notes: z.string().optional(),
      status: z.enum(['Active', 'Inactive', 'Lead']).optional()
    })
  },

  addMember: {
    params: z.object({
      businessId: z.string().min(1, 'Business ID is required')
    }),
    body: z.object({
      userId: z.string().min(1, 'User ID is required'),
      role: z.nativeEnum(Role)
    })
  },

  updateMemberRole: {
    params: z.object({
      businessId: z.string().min(1, 'Business ID is required'),
      userId: z.string().min(1, 'User ID is required')
    }),
    body: z.object({
      role: z.nativeEnum(Role)
    })
  },

  removeMember: {
    params: z.object({
      businessId: z.string().min(1, 'Business ID is required'),
      userId: z.string().min(1, 'User ID is required')
    })
  },

  getBusinessMembers: {
    params: z.object({
      businessId: z.string().min(1, 'Business ID is required')
    }),
    query: z.object({
      role: z.nativeEnum(Role).optional(),
      search: z.string().optional()
    }).optional()
  },

  getBusiness: {
    params: z.object({
      businessId: z.string().min(1, 'Business ID is required')
    })
  }
};