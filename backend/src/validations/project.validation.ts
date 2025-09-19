import Joi from 'joi';

export const projectValidation = {
  createProject: Joi.object({
    name: Joi.string().required().min(2).max(100),
    description: Joi.string().required().min(10).max(1000),
    businessId: Joi.string().required(),
    startDate: Joi.date().required(),
    endDate: Joi.date().required().min(Joi.ref('startDate')),
    status: Joi.string().valid('Not Started', 'In Progress', 'On Hold', 'Completed')
  }),

  updateProject: Joi.object({
    name: Joi.string().min(2).max(100),
    description: Joi.string().min(10).max(1000),
    startDate: Joi.date(),
    endDate: Joi.date().min(Joi.ref('startDate')),
    status: Joi.string().valid('Not Started', 'In Progress', 'On Hold', 'Completed')
  }),

  addMember: Joi.object({
    memberId: Joi.string().required()
  })
};