import { Request, Response, NextFunction } from 'express';
import { Schema } from 'joi';
import { logger } from '../utils/logger';

export const validateRequest = (schema: Schema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body);
    
    if (error) {
      logger.error('Validation error:', error);
      return res.status(400).json({
        message: 'Validation error',
        errors: error.details.map(detail => detail.message)
      });
    }

    next();
  };
};