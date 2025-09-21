import { z } from 'zod';
import { ProjectStatus } from '../types/enums';

const createProjectSchema = z.object({
  name: z.string().trim().min(1, 'Project name is required'),
  client: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Valid client ID is required'),
  status: z.nativeEnum(ProjectStatus),
  progress: z.number().int().min(0).max(100).default(0),
  deadline: z.string().datetime('Valid deadline date is required'),
  team: z.array(z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid team member ID')),
  description: z.string().trim().max(1000, 'Description cannot exceed 1000 characters').optional()
});

const updateProjectSchema = z.object({
  name: z.string().trim().min(1, 'Project name is required').optional(),
  client: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Valid client ID is required').optional(),
  status: z.nativeEnum(ProjectStatus).optional(),
  progress: z.number().int().min(0).max(100).optional(),
  deadline: z.string().datetime('Valid deadline date is required').optional(),
  team: z.array(z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid team member ID')).optional(),
  description: z.string().trim().max(1000, 'Description cannot exceed 1000 characters').optional()
});

export const projectValidation = {
  createProject: {
    body: createProjectSchema
  },
  
  updateProject: {
    body: updateProjectSchema
  }
};