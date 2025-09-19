import { Request, Response, NextFunction } from 'express';
import { User } from '../models/user.model';
import { JwtService } from '../services/jwt.service';
import { AppError } from '../middleware/error-handler';
import { UserStatus } from '../types/enums';

export const authController = {
  // Register new user
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, email, password, role, department } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        throw new AppError(400, 'Email already registered');
      }

      // Create new user
      const user = await User.create({
        name,
        email,
        password,
        role,
        department,
        status: UserStatus.Offline
      });

      // Generate token
      const token = JwtService.generateToken(user);

      res.status(201).json({
        success: true,
        data: {
          user,
          token
        }
      });
    } catch (error) {
      next(error);
    }
  },

  // Login user
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;

      // Find user
      const user = await User.findOne({ email }).select('+password');
      if (!user) {
        throw new AppError(401, 'Invalid credentials');
      }

      // Check password
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        throw new AppError(401, 'Invalid credentials');
      }

      // Update status
      user.status = UserStatus.Online;
      await user.save();

      // Generate token
      const token = JwtService.generateToken(user);

      res.json({
        success: true,
        data: {
          user,
          token
        }
      });
    } catch (error) {
      next(error);
    }
  },

  // Get current user
  async me(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await User.findById(req.user._id);
      if (!user) {
        throw new AppError(404, 'User not found');
      }

      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      next(error);
    }
  },

  // Logout user
  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      // Update status
      await User.findByIdAndUpdate(req.user._id, { status: UserStatus.Offline });

      res.json({
        success: true,
        message: 'Logged out successfully'
      });
    } catch (error) {
      next(error);
    }
  }
};