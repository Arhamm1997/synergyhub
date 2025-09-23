import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import mongoose from 'mongoose';
import { logger } from '../utils/logger';

export enum ErrorType {
  VALIDATION = 'ValidationError',
  AUTHENTICATION = 'AuthenticationError',
  AUTHORIZATION = 'AuthorizationError',
  NOT_FOUND = 'NotFoundError',
  CONFLICT = 'ConflictError',
  INTERNAL = 'InternalError'
}

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public type: ErrorType = ErrorType.INTERNAL,
    public errors?: any,
    public isOperational: boolean = true
  ) {
    super(message);
    this.name = type;
    Object.setPrototypeOf(this, AppError.prototype);
  }

  static badRequest(message: string, errors?: any) {
    return new AppError(400, message, ErrorType.VALIDATION, errors);
  }

  static unauthorized(message = 'Unauthorized') {
    return new AppError(401, message, ErrorType.AUTHENTICATION);
  }

  static forbidden(message = 'Forbidden') {
    return new AppError(403, message, ErrorType.AUTHORIZATION);
  }

  static notFound(message: string) {
    return new AppError(404, message, ErrorType.NOT_FOUND);
  }

  static conflict(message: string) {
    return new AppError(409, message, ErrorType.CONFLICT);
  }

  static internal(message = 'Internal server error') {
    return new AppError(500, message, ErrorType.INTERNAL);
  }
}

interface ErrorResponse {
  success: false;
  error: {
    type: string;
    message: string;
    errors?: any;
    stack?: string;
  };
}

export const errorHandler = (
  err: Error | AppError | ZodError | mongoose.Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
) => {
  let error = err;

  // Convert Zod validation errors
  if (err instanceof ZodError) {
    error = AppError.badRequest('Validation failed', err.errors);
  }

  // Convert Mongoose validation errors
  if (err instanceof mongoose.Error.ValidationError) {
    error = AppError.badRequest('Validation failed', Object.values(err.errors).map(e => ({
      field: e.path,
      message: e.message
    })));
  }

  // Convert Mongoose duplicate key errors
  if (err instanceof Error && 'code' in err && err.code === 11000) {
    error = AppError.conflict('Duplicate field value entered');
  }

  // Convert Mongoose cast errors
  if (err instanceof mongoose.Error.CastError) {
    error = AppError.badRequest(`Invalid ${err.path}: ${err.value}`);
  }

  // Prepare response
  const response: ErrorResponse = {
    success: false,
    error: {
      type: error instanceof AppError ? error.type : ErrorType.INTERNAL,
      message: error.message
    }
  };

  // Add detailed errors for validation failures
  if (error instanceof AppError && error.errors) {
    response.error.errors = error.errors;
  }

  // Add stack trace in development
  if (process.env.NODE_ENV === 'development') {
    response.error.stack = error.stack;
  }

  // Log server errors
  if (!(error instanceof AppError) || error.statusCode >= 500) {
    logger.error({
      message: error.message,
      type: response.error.type,
      stack: error.stack,
      path: req.path,
      method: req.method,
      body: req.body,
      query: req.query,
      params: req.params
    });
  }

  // Send response
  res.status(error instanceof AppError ? error.statusCode : 500).json(response);
};