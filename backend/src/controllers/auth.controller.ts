import { Request, Response, NextFunction } from 'express';
import { User } from '../models/user.model';
import { Business } from '../models/business.model';
import { Invitation } from '../models/invitation.model';
import { AdminRequest, AdminRequestStatus } from '../models/admin-request.model';
import { AuditLog, SystemEvent } from '../models/audit.model';
import { JwtService, generateToken } from '../services/jwt.service';
import { sendNotification } from '../services/notification.service';
import { sendEmail, emailService } from '../services/email.service';
import { AppError } from '../middleware/error-handler';
import { UserStatus, Role } from '../types/enums';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

export const authController = {
  // Check if this is the first user registration
  async checkFirstUser(req: Request, res: Response, next: NextFunction) {
    try {
      const userCount = await User.countDocuments();
      const isFirstUser = userCount === 0;

      res.json({
        success: true,
        data: {
          isFirstUser,
          totalUsers: userCount
        }
      });
    } catch (error) {
      next(error);
    }
  },

  // Get admin statistics
  async getAdminStats(req: Request, res: Response, next: NextFunction) {
    try {
      const adminCount = await User.countDocuments({
        role: { $in: ['Admin', 'SuperAdmin'] }
      });

      const memberCount = await User.countDocuments({
        role: 'Member'
      });

      res.json({
        success: true,
        data: {
          adminCount,
          memberCount,
          maxAdmins: 20,
          adminSlotsRemaining: Math.max(0, 20 - adminCount)
        }
      });
    } catch (error) {
      next(error);
    }
  },

  // Register new user (enhanced with admin account limits)
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, email, password, invitationToken, profileData, role } = req.body;
      const ipAddress = req.ip;

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        throw new AppError(400, 'Email already registered');
      }

      let userRole = Role.Member;
      let businessId;

      // If invitation token provided, validate it
      if (invitationToken) {
        const invitation = await Invitation.findOne({
          token: invitationToken,
          email,
          status: 'Pending',
          expiresAt: { $gt: new Date() }
        }).populate('business');

        if (!invitation) {
          throw new AppError(400, 'Invalid or expired invitation');
        }

        userRole = invitation.role;
        businessId = invitation.business;

        // Mark invitation as accepted
        invitation.status = 'accepted';
        invitation.acceptedAt = new Date();
        await invitation.save();
      } else {
        // Check if this is the first user (SuperAdmin)
        const userCount = await User.countDocuments();
        if (userCount === 0) {
          userRole = Role.SuperAdmin;
        } else {
          // Handle admin account creation with limit
          if (role === Role.Admin) {
            const adminCount = await User.countDocuments({
              role: { $in: [Role.Admin, Role.SuperAdmin] }
            });

            if (adminCount >= 20) {
              throw new AppError(400, 'Maximum number of admin accounts (20) reached');
            }

            userRole = Role.Admin;
          } else {
            // For employee accounts, allow unlimited but set as member
            userRole = Role.Member;
          }
        }
      }

      // Create user with enhanced profile
      const nameParts = name.split(' ');
      const firstName = nameParts[0] || name;
      const lastName = nameParts.slice(1).join(' ') || '';

      const userData = {
        name,
        email,
        password,
        role: userRole,
        status: UserStatus.Offline,
        isVerified: userRole === Role.SuperAdmin ? true : false, // Auto-verify first super admin
        profile: {
          firstName: profileData?.firstName || firstName,
          lastName: profileData?.lastName || lastName,
          title: profileData?.title,
          bio: profileData?.bio,
          phone: profileData?.phone,
          timezone: profileData?.timezone || 'UTC',
          location: profileData?.location,
          skills: profileData?.skills || [],
          languages: profileData?.languages || ['English']
        },
        businesses: businessId ? [businessId] : [],
        defaultBusiness: businessId,
        preferences: {
          theme: 'light',
          notifications: {
            email: true,
            push: true,
            taskUpdates: true,
            projectUpdates: true,
            mentions: true
          },
          workingHours: {
            start: '09:00',
            end: '17:00',
            timezone: profileData?.timezone || 'UTC',
            workingDays: [1, 2, 3, 4, 5]
          }
        }
      };

      const user = await User.create(userData);

      // Add user to business if applicable
      if (businessId) {
        const business = await Business.findById(businessId);
        if (business) {
          await business.addMember(user._id, userRole);
        }
      }

      // Log system event
      await SystemEvent.create({
        type: 'USER_REGISTRATION',
        user: user._id,
        business: businessId,
        description: `New user registered: ${user.email} as ${userRole}`,
        severity: 'Low',
        metadata: {
          userRole,
          invitationUsed: !!invitationToken
        },
        ipAddress
      });

      // Generate verification token
      const verificationToken = crypto.randomBytes(32).toString('hex');
      user.resetPasswordToken = verificationToken;
      user.resetPasswordExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
      await user.save();

      // Send verification email (don't fail signup if email fails in development)
      try {
        await emailService.sendWelcomeEmail({
          to: user.email,
          name: user.profile.firstName || user.name,
          businessName: businessId ? (await Business.findById(businessId))?.name : 'SynergyHub'
        });
      } catch (emailError) {
        console.error('Failed to send welcome email:', emailError);
        // Don't fail the signup process for email issues in development
        if (process.env.NODE_ENV !== 'development') {
          throw emailError;
        }
      }

      // Generate token
      const token = generateToken(user);

      res.status(201).json({
        success: true,
        message: 'Registration successful. Please check your email for verification.',
        data: {
          user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            profile: user.profile,
            isVerified: user.isVerified
          },
          token,
          requiresVerification: true
        }
      });
    } catch (error) {
      next(error);
    }
  },

  // Email verification
  async verifyEmail(req: Request, res: Response, next: NextFunction) {
    try {
      const { token } = req.body;

      const user = await User.findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: new Date() }
      });

      if (!user) {
        throw new AppError(400, 'Invalid or expired verification token');
      }

      user.isVerified = true;
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();

      // Log system event
      await SystemEvent.create({
        type: 'EMAIL_VERIFICATION',
        user: user._id,
        description: `Email verified for user: ${user.email}`,
        severity: 'Low'
      });

      res.json({
        success: true,
        message: 'Email verified successfully'
      });
    } catch (error) {
      next(error);
    }
  },

  // Login with enhanced security
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      const ipAddress = req.ip;
      const userAgent = req.get('User-Agent');

      // Find user with password
      const user = await User.findOne({ email }).select('+password +loginAttempts +lockUntil');
      if (!user) {
        throw new AppError(401, 'Invalid credentials');
      }

      // Check if account is locked
      if ((user as any).isLocked) {
        throw new AppError(423, 'Account is locked due to too many failed login attempts');
      }

      // Check password
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        await user.incLoginAttempts();

        // Log failed login attempt
        await SystemEvent.create({
          type: 'LOGIN',
          user: user._id,
          description: `Failed login attempt for ${email}`,
          severity: 'Medium',
          metadata: { reason: 'Invalid password' },
          ipAddress
        });

        throw new AppError(401, 'Invalid credentials');
      }

      // Check if user is active
      if (!user.isActive) {
        throw new AppError(403, 'Account is deactivated');
      }

      // Reset login attempts on successful login
      if (user.loginAttempts > 0) {
        await user.resetLoginAttempts();
      }

      // Update user status and last login
      user.status = UserStatus.Online;
      user.lastLoginAt = new Date();
      user.lastActive = new Date();
      await user.save();

      // Log successful login
      await SystemEvent.create({
        type: 'LOGIN',
        user: user._id,
        business: user.defaultBusiness,
        description: `Successful login for ${email}`,
        severity: 'Low',
        ipAddress
      });

      // Generate token
      const token = generateToken(user);

      // Populate user data
      await user.populate([
        { path: 'businesses', select: 'name description' },
        { path: 'defaultBusiness', select: 'name description' },
        { path: 'manager', select: 'name profile' },
        { path: 'directReports', select: 'name profile role' }
      ]);

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

  // Enhanced logout
  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await User.findByIdAndUpdate(
        req.user._id,
        {
          status: UserStatus.Offline,
          lastActive: new Date()
        },
        { new: true }
      );

      // Log logout
      await SystemEvent.create({
        type: 'LOGOUT',
        user: req.user._id,
        business: user?.defaultBusiness,
        description: `User logged out: ${user?.email}`,
        severity: 'Low',
        ipAddress: req.ip
      });

      res.json({
        success: true,
        message: 'Logged out successfully'
      });
    } catch (error) {
      next(error);
    }
  },

  // Get current user with full profile
  async me(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await User.findById(req.user._id)
        .populate('businesses', 'name description memberCounts')
        .populate('defaultBusiness', 'name description')
        .populate('manager', 'name profile avatarUrl')
        .populate('directReports', 'name profile role status');

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

  // Update user profile
  async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const updates = req.body;
      const allowedUpdates = [
        'profile', 'preferences', 'avatarUrl', 'phone'
      ];

      // Filter allowed updates
      const filteredUpdates: any = {};
      Object.keys(updates).forEach(key => {
        if (allowedUpdates.includes(key)) {
          filteredUpdates[key] = updates[key];
        }
      });

      const user = await User.findByIdAndUpdate(
        req.user._id,
        filteredUpdates,
        { new: true, runValidators: true }
      );

      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      next(error);
    }
  },

  // Password reset request
  async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.body;

      const user = await User.findOne({ email });
      if (!user) {
        // Don't reveal if email exists
        return res.json({
          success: true,
          message: 'If the email exists, a password reset link has been sent'
        });
      }

      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      user.resetPasswordToken = resetToken;
      user.resetPasswordExpires = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
      await user.save();

      // Send reset email
      await emailService.sendPasswordResetEmail({
        to: user.email,
        name: user.profile.firstName || user.name,
        resetUrl: `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`
      });

      res.json({
        success: true,
        message: 'If the email exists, a password reset link has been sent'
      });
    } catch (error) {
      next(error);
    }
  },

  // Reset password
  async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { token, password } = req.body;

      const user = await User.findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: new Date() }
      });

      if (!user) {
        throw new AppError(400, 'Invalid or expired reset token');
      }

      user.password = password;
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();

      // Log password change
      await SystemEvent.create({
        type: 'PASSWORD_CHANGE',
        user: user._id,
        description: `Password reset for user: ${user.email}`,
        severity: 'Medium'
      });

      res.json({
        success: true,
        message: 'Password reset successfully'
      });
    } catch (error) {
      next(error);
    }
  },

  // Change password (authenticated)
  async changePassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { currentPassword, newPassword } = req.body;

      const user = await User.findById(req.user._id).select('+password');
      if (!user) {
        throw new AppError(404, 'User not found');
      }

      // Verify current password
      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch) {
        throw new AppError(401, 'Current password is incorrect');
      }

      user.password = newPassword;
      await user.save();

      // Log password change
      await SystemEvent.create({
        type: 'PASSWORD_CHANGE',
        user: user._id,
        business: user.defaultBusiness,
        description: `Password changed by user: ${user.email}`,
        severity: 'Low'
      });

      res.json({
        success: true,
        message: 'Password changed successfully'
      });
    } catch (error) {
      next(error);
    }
  },

  // Get admin requests (for processing admin approvals)
  async getAdminRequests(req: Request, res: Response, next: NextFunction) {
    try {
      // Only super admins can view admin requests
      if (req.user.role !== 'super_admin') {
        throw new AppError(403, 'Access denied. Super admin privileges required.');
      }

      const {
        page = 1,
        limit = 10,
        status,
        businessId
      } = req.query;

      const filter: any = {};
      if (status) filter.status = status;
      if (businessId) filter.business = businessId;

      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const skip = (pageNum - 1) * limitNum;

      const [requests, total] = await Promise.all([
        AdminRequest.find(filter)
          .populate('user', 'name email profile')
          .populate('business', 'name description')
          .populate('processedBy', 'name email')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limitNum),
        AdminRequest.countDocuments(filter)
      ]);

      res.json({
        success: true,
        data: {
          requests,
          pagination: {
            page: pageNum,
            limit: limitNum,
            total,
            pages: Math.ceil(total / limitNum)
          }
        }
      });
    } catch (error) {
      next(error);
    }
  },

  // Process admin request (approve/reject)
  async processAdminRequest(req: Request, res: Response, next: NextFunction) {
    try {
      const { requestId } = req.params;
      const { action, reason } = req.body; // action: 'approve' | 'reject'

      // Only super admins can process admin requests
      if (req.user.role !== 'super_admin') {
        throw new AppError(403, 'Access denied. Super admin privileges required.');
      }

      const adminRequest = await AdminRequest.findById(requestId)
        .populate('user', 'name email')
        .populate('business', 'name');

      if (!adminRequest) {
        throw new AppError(404, 'Admin request not found');
      }

      if (adminRequest.status !== AdminRequestStatus.Pending) {
        throw new AppError(400, 'This request has already been processed');
      }

      if (action === 'approve') {
        // Update user role to admin
        await User.findByIdAndUpdate(adminRequest.user, {
          role: Role.Admin
        });

        adminRequest.status = AdminRequestStatus.Approved;
        adminRequest.processedBy = req.user._id;
        adminRequest.processedAt = new Date();
        adminRequest.reason = reason;

        // Send notification to user
        await sendNotification({
          user: adminRequest.user,
          message: `Your admin request has been approved`,
          type: 'ADMIN_REQUEST_APPROVED',
          data: { businessId: adminRequest.business }
        });

        // Log audit trail
        await AuditLog.create({
          user: req.user._id,
          business: adminRequest.business,
          action: 'APPROVE_ADMIN_REQUEST',
          resourceType: 'AdminRequest',
          resourceId: adminRequest._id,
          metadata: {
            approvedUserId: adminRequest.user
          }
        });

      } else if (action === 'reject') {
        adminRequest.status = AdminRequestStatus.Rejected;
        adminRequest.processedBy = req.user._id;
        adminRequest.processedAt = new Date();
        adminRequest.reason = reason || 'Request denied';

        // Send notification to user
        await sendNotification({
          user: adminRequest.user,
          message: `Your admin request has been rejected${reason ? `: ${reason}` : ''}`,
          type: 'ADMIN_REQUEST_REJECTED',
          data: { businessId: adminRequest.business }
        });

      } else {
        throw new AppError(400, 'Invalid action. Must be "approve" or "reject"');
      }

      await adminRequest.save();

      res.json({
        success: true,
        message: `Admin request ${action}d successfully`,
        data: adminRequest
      });
    } catch (error) {
      next(error);
    }
  }
};