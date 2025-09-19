import { Request, Response, NextFunction } from 'express';
import { JwtService } from '../services/jwt.service';
import { User } from '../models/user.model';
import { logger } from '../utils/logger';

interface AuthRequest extends Request {
  user?: any;
}

export const auth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      throw new Error();
    }

    const decoded = JwtService.verifyToken(token);
    const user = await User.findById(decoded.userId);

    if (!user) {
      throw new Error();
    }

    req.user = user;
    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    res.status(401).json({ message: 'Please authenticate' });
  }
};