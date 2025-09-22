import { Request, Response, NextFunction } from 'express';
import { User } from '../models/user.model';
import { AdminRequest, AdminRequestStatus } from '../models/admin-request.model';
import { JwtService } from '../services/jwt.service';
import { NotificationService } from '../services/notification.service';
import { AppError } from '../middleware/error-handler';
import { UserStatus, Role } from '../types/enums';

export const authController = {
  // Register new user
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, email, password, role } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        throw new AppError(400, 'Email already registered');
      }

      // If trying to register as admin, check if there are existing admins
      if (role === Role.Admin) {
        const existingAdmins = await User.find({ role: Role.Admin });
        
        // If there are existing admins, create an admin request instead
        if (existingAdmins.length > 0) {
          const adminRequest = await AdminRequest.create({
            name,
            email,
            hashedPassword: password, // Will be hashed by the model
            status: AdminRequestStatus.Pending
          });

          // Notify existing admins
          const notificationService = new NotificationService();
          await notificationService.notifyAdmins({
            title: 'New Admin Request',
            message: `${name} has requested to join as an admin.`,
            type: 'ADMIN_REQUEST',
            data: { requestId: adminRequest._id }
          });

          return res.status(202).json({
            success: true,
            message: 'Admin request submitted for approval',
            data: {
              requestStatus: 'pending',
              email
            }
          });
        }
      }

      // Create new user
      const user = await User.create({
        name,
        email,
        password,
        role,
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

  // Process admin request
  async processAdminRequest(req: Request, res: Response, next: NextFunction) {
    try {
      const { requestId } = req.params;
      const { status, reason } = req.body;
      const adminId = req.user._id;

      const adminRequest = await AdminRequest.findById(requestId);
      if (!adminRequest) {
        throw new AppError(404, 'Admin request not found');
      }

      if (adminRequest.status !== AdminRequestStatus.Pending) {
        throw new AppError(400, 'This request has already been processed');
      }

      adminRequest.status = status;
      adminRequest.processedBy = adminId;
      adminRequest.processedAt = new Date();
      adminRequest.reason = reason;
      await adminRequest.save();

      if (status === AdminRequestStatus.Approved) {
        const user = await User.create({
          name: adminRequest.name,
          email: adminRequest.email,
          password: adminRequest.hashedPassword,
          role: Role.Admin,
          status: UserStatus.Offline
        });

        // Notify the approved user
        const notificationService = new NotificationService();
        await notificationService.notify(user._id, {
          title: 'Admin Request Approved',
          message: 'Your request to join as an admin has been approved.',
          type: 'ADMIN_REQUEST_APPROVED'
        });
      }

      res.json({
        success: true,
        message: `Admin request ${status.toLowerCase()}`,
        data: adminRequest
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
  },

  // Get all admin requests
  async getAdminRequests(req: Request, res: Response, next: NextFunction) {
    try {
      const adminRequests = await AdminRequest.find({})
        .sort({ requestedAt: -1 })
        .populate('processedBy', 'name email');

      res.json({
        success: true,
        data: adminRequests
      });
    } catch (error) {
      next(error);
    }
  }
};