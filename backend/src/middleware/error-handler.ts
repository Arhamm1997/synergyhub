import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public errors?: any,
    public isOperational: boolean = true
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

interface ErrorResponse {
  status: 'error' | 'fail';
  message: string;
  errors?: any;
  stack?: string;
}

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
) => {
  const statusCode = err instanceof AppError ? err.statusCode : 500;
  const response: ErrorResponse = {
    status: statusCode >= 500 ? 'error' : 'fail',
    message: err.message
  };

  // Add errors if available (for validation errors)
  if (err instanceof AppError && err.errors) {
    response.errors = err.errors;
  }

  if (process.env.NODE_ENV === 'development') {
    response.stack = err.stack;
  }

  // Log error
  if (statusCode >= 500) {
    logger.error({
      message: err.message,
      stack: err.stack,
      statusCode,
      path: req.path
    });
  }

  res.status(statusCode).json(response);
};