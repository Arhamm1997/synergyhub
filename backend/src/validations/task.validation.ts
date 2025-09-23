import { z } from 'zod';
import { Priority, TaskStatus } from '../types/enums';

const createTaskSchema = z.object({
  title: z.string().trim().min(1, 'Task title is required'),
  project: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Valid project ID is required'),
  assignee: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Valid assignee ID is required'),
  priority: z.nativeEnum(Priority),
  status: z.nativeEnum(TaskStatus),
  dueDate: z.string().datetime('Valid due date is required'),
  startDate: z.string().datetime('Valid start date is required').optional(),
  estimatedHours: z.number().positive('Estimated hours must be positive').optional(),
  description: z.string().trim().max(1000, 'Description cannot exceed 1000 characters').optional(),
  tags: z.array(z.string()).optional(),
  labels: z.array(z.string()).optional(),
  dependencies: z.array(z.string().regex(/^[0-9a-fA-F]{24}$/)).optional(),
  watchers: z.array(z.string().regex(/^[0-9a-fA-F]{24}$/)).optional(),
  subtasks: z.array(z.object({
    title: z.string().trim().min(1),
    assignee: z.string().regex(/^[0-9a-fA-F]{24}$/).optional()
  })).optional(),
  customFields: z.record(z.any()).optional()
});

const updateTaskSchema = z.object({
  title: z.string().trim().min(1, 'Task title is required').optional(),
  project: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Valid project ID is required').optional(),
  assignee: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Valid assignee ID is required').optional(),
  priority: z.nativeEnum(Priority).optional(),
  status: z.nativeEnum(TaskStatus).optional(),
  dueDate: z.string().datetime('Valid due date is required').optional(),
  startDate: z.string().datetime('Valid start date is required').optional(),
  estimatedHours: z.number().positive('Estimated hours must be positive').optional(),
  description: z.string().trim().max(1000, 'Description cannot exceed 1000 characters').optional(),
  tags: z.array(z.string()).optional(),
  labels: z.array(z.string()).optional(),
  dependencies: z.array(z.string().regex(/^[0-9a-fA-F]{24}$/)).optional(),
  watchers: z.array(z.string().regex(/^[0-9a-fA-F]{24}$/)).optional(),
  subtasks: z.array(z.object({
    title: z.string().trim().min(1),
    completed: z.boolean().optional(),
    assignee: z.string().regex(/^[0-9a-fA-F]{24}$/).optional()
  })).optional(),
  customFields: z.record(z.any()).optional()
});

const queryTasksSchema = z.object({
  page: z.string().transform(Number).pipe(z.number().positive()).optional(),
  limit: z.string().transform(Number).pipe(z.number().positive().max(100)).optional(),
  assignee: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid assignee ID').optional(),
  project: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid project ID').optional(),
  status: z.nativeEnum(TaskStatus).optional(),
  priority: z.nativeEnum(Priority).optional(),
  tags: z.union([z.string(), z.array(z.string())]).optional(),
  labels: z.union([z.string(), z.array(z.string())]).optional(),
  dueDate: z.string().datetime().optional(),
  search: z.string().optional(),
  sortBy: z.enum(['createdAt', 'updatedAt', 'dueDate', 'priority', 'status', 'title']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional()
});

const addCommentSchema = z.object({
  content: z.string().trim().min(1, 'Comment content is required').max(1000, 'Comment cannot exceed 1000 characters')
});

const addTimeEntrySchema = z.object({
  startTime: z.string().datetime('Valid start time is required'),
  endTime: z.string().datetime('Valid end time is required').optional(),
  duration: z.number().positive('Duration must be positive').optional(),
  description: z.string().trim().max(500, 'Description cannot exceed 500 characters').optional()
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
  },

  addComment: {
    body: addCommentSchema
  },

  addTimeEntry: {
    body: addTimeEntrySchema
  }
};