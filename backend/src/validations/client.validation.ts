import { z } from 'zod';
import { ClientStatus } from '../types/enums';

const contactInfoSchema = z.object({
  email: z.string().email('Invalid email address').optional(),
  phone: z.string().regex(/^\+?[\d\s-]+$/, 'Invalid phone number').optional(),
  address: z.string().trim().optional()
}).optional();

const createClientSchema = z.object({
  name: z.string().trim().min(1, 'Client name is required'),
  logoUrl: z.string().url('Valid logo URL is required'),
  logoHint: z.string().trim().min(1, 'Logo hint is required'),
  status: z.nativeEnum(ClientStatus),
  progress: z.number().int().min(0).max(100).optional(),
  assignees: z.array(z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid assignee ID')),
  services: z.array(z.string()).optional(),
  contactInfo: contactInfoSchema
});

const updateClientSchema = z.object({
  name: z.string().trim().min(1, 'Client name is required').optional(),
  logoUrl: z.string().url('Valid logo URL is required').optional(),
  logoHint: z.string().trim().min(1, 'Logo hint is required').optional(),
  status: z.nativeEnum(ClientStatus).optional(),
  progress: z.number().int().min(0).max(100).optional(),
  assignees: z.array(z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid assignee ID')).optional(),
  services: z.array(z.string()).optional(),
  contactInfo: contactInfoSchema
});

export const clientValidation = {
  createClient: {
    body: createClientSchema
  },
  
  updateClient: {
    body: updateClientSchema
  }
};