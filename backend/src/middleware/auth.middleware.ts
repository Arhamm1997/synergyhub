import { Request, Response, NextFunction } from 'express';
import { JwtService } from '../services/jwt.service';
import { User } from '../models/user.model';
import { AppError } from './error-handler';

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      throw new AppError(401, 'Authentication token is required');
    }

    // Verify token
    const decoded = JwtService.verifyToken(token);

    // Get user
    const user = await User.findById(decoded.userId);
    if (!user) {
      throw new AppError(401, 'User not found');
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    next(new AppError(401, 'Please authenticate'));
  }
};

export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError(401, 'Please authenticate'));
    }

    if (!roles.includes(req.user.role)) {
      return next(new AppError(403, 'Not authorized to access this resource'));
    }

    next();
  };
};