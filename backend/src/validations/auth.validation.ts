import Joi from 'joi';

export const authValidation = {
  register: Joi.object({
    name: Joi.string().required().min(2).max(100),
    email: Joi.string().required().email(),
    password: Joi.string().required().min(6).max(40),
    confirmPassword: Joi.string().required().valid(Joi.ref('password'))
  }),

  login: Joi.object({
    email: Joi.string().required().email(),
    password: Joi.string().required()
  }),

  updateProfile: Joi.object({
    name: Joi.string().min(2).max(100),
    email: Joi.string().email(),
    profileImage: Joi.string()
  }),

  changePassword: Joi.object({
    currentPassword: Joi.string().required(),
    newPassword: Joi.string().required().min(6).max(40),
    confirmNewPassword: Joi.string().required().valid(Joi.ref('newPassword'))
  }),

  forgotPassword: Joi.object({
    email: Joi.string().required().email()
  }),

  resetPassword: Joi.object({
    password: Joi.string().required().min(6).max(40),
    confirmPassword: Joi.string().required().valid(Joi.ref('password'))
  })
};