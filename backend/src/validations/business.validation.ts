import { z } from 'zod';
import { Role } from '../types/enums';

const businessMemberSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  email: z.string().email(),
  role: z.nativeEnum(Role),
  department: z.string().min(1, 'Department is required'),
  permissions: z.array(z.string()).optional()
});

const quotasSchema = z.object({
  maxAdmins: z.number().min(1).max(20),
  maxMembers: z.number().min(1).max(1000),
  currentAdmins: z.number().min(0),
  currentMembers: z.number().min(0)
});

export const businessValidation = {
  createBusiness: {
    body: z.object({
      name: z.string().min(2, 'Business name must be at least 2 characters').max(100),
      description: z.string().min(10, 'Description must be at least 10 characters').max(500),
      type: z.string().min(2, 'Business type must be at least 2 characters'),
      phone: z.string().optional(),
      website: z.string().url().optional(),
      address: z.string().optional(),
      quotas: quotasSchema.optional()
    })
  },

  updateBusiness: {
    params: z.object({
      businessId: z.string().min(1, 'Business ID is required')
    }),
    body: z.object({
      name: z.string().min(2).max(100).optional(),
      description: z.string().min(10).max(500).optional(),
      type: z.string().min(2).optional(),
      phone: z.string().optional(),
      website: z.string().url().optional(),
      address: z.string().optional(),
      quotas: quotasSchema.optional()
    })
  },

  updateQuotas: {
    params: z.object({
      businessId: z.string().min(1, 'Business ID is required')
    }),
    body: quotasSchema
  },

  addMember: {
    params: z.object({
      businessId: z.string().min(1, 'Business ID is required')
    }),
    body: businessMemberSchema
  },

  updateMember: {
    params: z.object({
      businessId: z.string().min(1, 'Business ID is required'),
      memberId: z.string().min(1, 'Member ID is required')
    }),
    body: businessMemberSchema.partial()
  },

  removeMember: {
    params: z.object({
      businessId: z.string().min(1, 'Business ID is required'),
      memberId: z.string().min(1, 'Member ID is required')
    })
  },

  getBusinessMembers: {
    params: z.object({
      businessId: z.string().min(1, 'Business ID is required')
    }),
    query: z.object({
      role: z.nativeEnum(Role).optional(),
      department: z.string().optional(),
      search: z.string().optional()
    }).optional()
  },

  getBusiness: {
    params: z.object({
      businessId: z.string().min(1, 'Business ID is required')
    })
  }
};