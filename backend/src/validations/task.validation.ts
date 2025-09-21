import { z } from 'zod';
import { Priority, TaskStatus } from '../types/enums';

const createTaskSchema = z.object({
  title: z.string().trim().min(1, 'Task title is required'),
  project: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Valid project ID is required'),
  assignee: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Valid assignee ID is required'),
  priority: z.nativeEnum(Priority),
  status: z.nativeEnum(TaskStatus),
  dueDate: z.string().datetime('Valid due date is required'),
  description: z.string().trim().max(1000, 'Description cannot exceed 1000 characters').optional(),
  attachments: z.array(z.string()).optional()
});

const updateTaskSchema = z.object({
  title: z.string().trim().min(1, 'Task title is required').optional(),
  project: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Valid project ID is required').optional(),
  assignee: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Valid assignee ID is required').optional(),
  priority: z.nativeEnum(Priority).optional(),
  status: z.nativeEnum(TaskStatus).optional(),
  dueDate: z.string().datetime('Valid due date is required').optional(),
  description: z.string().trim().max(1000, 'Description cannot exceed 1000 characters').optional(),
  attachments: z.array(z.string()).optional()
});

const queryTasksSchema = z.object({
  assignee: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid assignee ID').optional()
});

export const taskValidation = {
  createTask: {
    body: createTaskSchema
  },
  
  updateTask: {
    body: updateTaskSchema
  },
  
  queryTasks: {
    query: queryTasksSchema
  }
};