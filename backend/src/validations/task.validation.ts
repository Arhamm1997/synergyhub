import Joi from 'joi';
import { Priority, TaskStatus } from '../types/enums';

const priorityValues = [
  Priority.Urgent,
  Priority.High,
  Priority.Medium,
  Priority.Low,
  Priority.None
];

const statusValues = [
  TaskStatus.Backlog,
  TaskStatus.Todo,
  TaskStatus.InProgress,
  TaskStatus.InReview,
  TaskStatus.Done,
  TaskStatus.Cancelled
];

export const taskValidation = {
  createTask: Joi.object({
    title: Joi.string().required().min(3).max(100),
    description: Joi.string().max(1000),
    projectId: Joi.string().required(),
    assigneeId: Joi.string().required(),
    priority: Joi.string().valid(...priorityValues),
    status: Joi.string().valid(...statusValues),
    dueDate: Joi.date().required(),
    attachments: Joi.array().items(Joi.string())
  }),

  updateTask: Joi.object({
    title: Joi.string().min(3).max(100),
    description: Joi.string().max(1000),
    assigneeId: Joi.string(),
    priority: Joi.string().valid(...priorityValues),
    status: Joi.string().valid(...statusValues),
    dueDate: Joi.date(),
    attachments: Joi.array().items(Joi.string())
  }),

  changeStatus: Joi.object({
    status: Joi.string().valid(...statusValues).required()
  }),

  changePriority: Joi.object({
    priority: Joi.string().valid(...priorityValues).required()
  }),

  changeAssignee: Joi.object({
    assigneeId: Joi.string().required()
  })
};