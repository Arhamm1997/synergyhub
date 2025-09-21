import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError, z } from 'zod';
import { logger } from '../utils/logger';

type ValidationSchemaObject = {
  body?: z.ZodType<any, any>;
  query?: z.ZodType<any, any>;
  params?: z.ZodType<any, any>;
};

export const validate = (schemas: ValidationSchemaObject) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (schemas.body) {
        req.body = await schemas.body.parseAsync(req.body);
      }
      if (schemas.query) {
        req.query = await schemas.query.parseAsync(req.query);
      }
      if (schemas.params) {
        req.params = await schemas.params.parseAsync(req.params);
      }
      return next();
    } catch (error) {
      if (error instanceof ZodError) {
        logger.error('Validation error:', error);
        return res.status(400).json({
          status: 'error',
          message: 'Validation failed',
          errors: error.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message
          }))
        });
      }
      return next(error);
    }
  };
};