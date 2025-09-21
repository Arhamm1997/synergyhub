import Joi from 'joi';

export const notificationValidation = {
  prioritizeNotifications: Joi.object({
    notifications: Joi.array()
      .items(Joi.string().regex(/^[0-9a-fA-F]{24}$/))
      .min(1)
      .required()
      .messages({
        'array.base': 'Notifications must be an array',
        'array.min': 'Notifications array cannot be empty',
        'string.pattern.base': 'All notification IDs must be valid MongoDB ObjectIds'
      })
  })
};