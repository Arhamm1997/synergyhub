import Joi from 'joi';

export const businessValidation = {
  createBusiness: Joi.object({
    name: Joi.string().required().min(2).max(100),
    description: Joi.string().required().min(10).max(500)
  }),

  updateBusiness: Joi.object({
    name: Joi.string().required().min(2).max(100),
    description: Joi.string().required().min(10).max(500)
  }),

  addMember: Joi.object({
    email: Joi.string().required().email()
  })
};