import { Request, Response, NextFunction } from 'express';
import { Business } from '../models/business.model';
import { User } from '../models/user.model';
import { Project } from '../models/project.model';
import { Task } from '../models/task.model';
import { Client } from '../models/client.model';
import { AuditLog } from '../models/audit.model';
import { Invitation } from '../models/invitation.model';
import { AdminRequest } from '../models/admin-request.model';
import { AppError } from '../middleware/error-handler';
import { sendNotification } from '../services/notification.service';
import { logger } from '../utils/logger';
import crypto from 'crypto';
import { emailService } from '../services/email.service';
import mongoose from 'mongoose';
import { Role } from '../types/enums';

export const businessController = {
  // Get all businesses for super admin or user's businesses
  async getBusinesses(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        page = 1,
        limit = 10,
        status,
        search,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = req.query;

      // Build filter based on user role
      let filter: any = {};

      if (req.user.role === 'super_admin') {
        // Super admin can see all businesses
        if (status) filter.status = status;
        if (search) {
          filter.$or = [
            { name: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } }
          ];
        }
      } else {
        // Regular users see only their businesses
        filter = {
          $or: [
            { owner: req.user._id },
            { 'members.user': req.user._id }
          ]
        };
        if (search) {
          filter.$and = [
            { $or: filter.$or },
            {
              $or: [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
              ]
            }
          ];
          delete filter.$or;
        }
      }

      // Build sort
      const sort: any = {};
      sort[sortBy as string] = sortOrder === 'asc' ? 1 : -1;

      // Calculate pagination
      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const skip = (pageNum - 1) * limitNum;

      const [businesses, total] = await Promise.all([
        Business.find(filter)
          .populate('owner', 'name email profile status')
          .populate('members.user', 'name email profile status')
          .sort(sort)
          .skip(skip)
          .limit(limitNum),
        Business.countDocuments(filter)
      ]);

      res.json({
        success: true,
        data: {
          businesses,
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

  // Get single business with detailed information
  async getBusiness(req: Request, res: Response, next: NextFunction) {
    try {
      const business = await Business.findById(req.params.id)
        .populate('owner', 'name email profile avatarUrl status')
        .populate('members.user', 'name email profile avatarUrl status department')
        .populate('members.invitedBy', 'name email');

      if (!business) {
        throw new AppError(404, 'Business not found');
      }

      // Check access permissions
      const hasAccess = business.owner.toString() === req.user._id.toString() ||
        business.members.some(m => m.user._id.toString() === req.user._id.toString()) ||
        req.user.role === 'super_admin';

      if (!hasAccess) {
        throw new AppError(403, 'Access denied to this business');
      }

      // Get business statistics
      const [
        totalProjects,
        totalTasks,
        totalClients,
        totalMembers,
        activeProjects,
        completedTasks
      ] = await Promise.all([
        Project.countDocuments({ business: business._id }),
        Task.countDocuments({ business: business._id }),
        Client.countDocuments({ business: business._id }),
        business.members.length + 1, // +1 for owner
        Project.countDocuments({ business: business._id, status: { $ne: 'Completed' } }),
        Task.countDocuments({ business: business._id, status: 'Done' })
      ]);

      const statistics = {
        totalProjects,
        totalTasks,
        totalClients,
        totalMembers,
        activeProjects,
        completedTasks,
        taskCompletionRate: totalTasks > 0 ? (completedTasks / totalTasks * 100).toFixed(1) : 0
      };

      res.json({
        success: true,
        data: {
          ...business.toObject(),
          statistics
        }
      });
    } catch (error) {
      next(error);
    }
  },

  // Create business
  async createBusiness(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        name,
        description,
        industry,
        website,
        phone,
        address,
        settings
      } = req.body;

      // Check if user already owns the maximum number of businesses
      const userBusinesses = await Business.countDocuments({ owner: req.user._id });
      if (userBusinesses >= 3 && req.user.role !== 'super_admin') {
        throw new AppError(400, 'You have reached the maximum limit of businesses');
      }

      const business = await Business.create({
        name,
        description,
        industry,
        website,
        phone,
        address,
        settings: settings || {
          workingHours: {
            start: '09:00',
            end: '17:00',
            timezone: 'UTC'
          },
          projectDefaults: {
            visibility: 'Team',
            priority: 'Medium'
          }
        },
        owner: req.user._id,
        members: []
      });

      await business.populate('owner', 'name email profile avatarUrl');

      // Create audit log
      await AuditLog.create({
        user: req.user._id,
        business: business._id,
        action: 'CREATE_BUSINESS',
        resourceType: 'Business',
        resourceId: business._id,
        metadata: { businessName: business.name }
      });

      res.status(201).json({
        success: true,
        data: business
      });
    } catch (error) {
      next(error);
    }
  },

  // Update business
  async updateBusiness(req: Request, res: Response, next: NextFunction) {
    try {
      const businessId = req.params.id;
      const updates = req.body;

      // Check permissions
      const business = await Business.findById(businessId);
      if (!business) {
        throw new AppError(404, 'Business not found');
      }

      if (business.owner.toString() !== req.user._id.toString() && req.user.role !== 'super_admin') {
        throw new AppError(403, 'Only business owner can update business details');
      }

      const oldBusiness = { ...business.toObject() };

      const updatedBusiness = await Business.findByIdAndUpdate(
        businessId,
        updates,
        { new: true, runValidators: true }
      )
        .populate('owner', 'name email profile avatarUrl')
        .populate('members.user', 'name email profile avatarUrl');

      // Track changes for audit log
      const changes: any = {};
      Object.keys(updates).forEach(key => {
        if (JSON.stringify(oldBusiness[key]) !== JSON.stringify(updates[key])) {
          changes[key] = {
            old: oldBusiness[key],
            new: updates[key]
          };
        }
      });

      if (Object.keys(changes).length > 0) {
        await AuditLog.create({
          user: req.user._id,
          business: businessId,
          action: 'UPDATE_BUSINESS',
          resourceType: 'Business',
          resourceId: businessId,
          changes,
          metadata: { businessName: updatedBusiness.name }
        });
      }

      res.json({
        success: true,
        data: updatedBusiness
      });
    } catch (error) {
      next(error);
    }
  },

  // Invite member to business
  async inviteMember(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, role, message } = req.body;
      const businessId = req.params.id;

      const business = await Business.findById(businessId);
      if (!business) {
        throw new AppError(404, 'Business not found');
      }

      // Check permissions
      if (business.owner.toString() !== req.user._id.toString()) {
        const member = business.members.find(m => m.user.toString() === req.user._id.toString());
        if (!member || !['Admin', 'Manager'].includes(member.role)) {
          throw new AppError(403, 'Only business owner, admins, or managers can invite members');
        }
      }

      // Check if user is already a member
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        const isMember = business.members.find(m => m.user.toString() === existingUser._id.toString()) ||
          business.owner.toString() === existingUser._id.toString();
        if (isMember) {
          throw new AppError(400, 'User is already a member of this business');
        }
      }

      // Check for existing invitation
      const existingInvitation = await Invitation.findOne({
        email,
        business: businessId,
        status: 'Pending'
      });

      if (existingInvitation) {
        throw new AppError(400, 'Invitation already sent to this email');
      }

      // Create invitation
      const inviteToken = crypto.randomBytes(32).toString('hex');
      const invitation = await Invitation.create({
        email,
        business: businessId,
        role: role || 'Member',
        invitedBy: req.user._id,
        token: inviteToken,
        message,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
      });

      // Send invitation email
      const inviteUrl = `${process.env.FRONTEND_URL}/invite/${inviteToken}`;
      await emailService.sendInvitationEmail(
        email,
        inviteUrl,
        role || 'Member',
        business.name,
        req.user.name
      );

      // Create audit log
      await AuditLog.create({
        user: req.user._id,
        business: businessId,
        action: 'INVITE_MEMBER',
        resourceType: 'Invitation',
        resourceId: invitation._id,
        metadata: {
          inviteeEmail: email,
          role,
          businessName: business.name
        }
      });

      res.status(201).json({
        success: true,
        message: 'Invitation sent successfully',
        data: {
          invitationId: invitation._id,
          email,
          role,
          expiresAt: invitation.expiresAt
        }
      });
    } catch (error) {
      next(error);
    }
  },

  // Update member role
  async updateMemberRole(req: Request, res: Response, next: NextFunction) {
    try {
      const { memberId } = req.params;
      const { role } = req.body;
      const businessId = req.params.id;

      const business = await Business.findById(businessId);
      if (!business) {
        throw new AppError(404, 'Business not found');
      }

      // Check permissions
      if (business.owner.toString() !== req.user._id.toString()) {
        throw new AppError(403, 'Only business owner can update member roles');
      }

      const member = business.members.find(m => m.user.toString() === memberId);
      if (!member) {
        throw new AppError(404, 'Member not found in this business');
      }

      const oldRole = member.role;
      member.role = role;
      await business.save();

      // Create audit log
      await AuditLog.create({
        user: req.user._id,
        business: businessId,
        action: 'UPDATE_MEMBER_ROLE',
        resourceType: 'Business',
        resourceId: businessId,
        changes: {
          memberRole: { old: oldRole, new: role }
        },
        metadata: {
          memberId,
          businessName: business.name
        }
      });

      // Notify the member
      await sendNotification({
        user: new mongoose.Types.ObjectId(memberId),
        message: `Your role in "${business.name}" has been updated to ${role}`,
        type: 'ROLE_UPDATED',
        data: { businessId, newRole: role }
      });

      res.json({
        success: true,
        message: 'Member role updated successfully'
      });
    } catch (error) {
      next(error);
    }
  },

  // Remove member from business
  async removeMember(req: Request, res: Response, next: NextFunction) {
    try {
      const { memberId } = req.params;
      const businessId = req.params.id;

      const business = await Business.findById(businessId);
      if (!business) {
        throw new AppError(404, 'Business not found');
      }

      // Check permissions
      if (business.owner.toString() !== req.user._id.toString()) {
        const requesterMember = business.members.find(m => m.user.toString() === req.user._id.toString());
        if (!requesterMember || !['Admin', 'Manager'].includes(requesterMember.role)) {
          throw new AppError(403, 'Only business owner, admins, or managers can remove members');
        }
      }

      // Can't remove owner
      if (business.owner.toString() === memberId) {
        throw new AppError(400, 'Cannot remove business owner');
      }

      const memberIndex = business.members.findIndex(m => m.user.toString() === memberId);
      if (memberIndex === -1) {
        throw new AppError(404, 'Member not found in this business');
      }

      business.members.splice(memberIndex, 1);
      await business.save();

      // Unassign member from all tasks and projects
      await Promise.all([
        Task.updateMany(
          { business: businessId, assignee: memberId },
          { $unset: { assignee: 1 } }
        ),
        Project.updateMany(
          { business: businessId, 'team.user': memberId },
          { $pull: { team: { user: memberId } } }
        )
      ]);

      // Create audit log
      await AuditLog.create({
        user: req.user._id,
        business: businessId,
        action: 'REMOVE_MEMBER',
        resourceType: 'Business',
        resourceId: businessId,
        metadata: {
          removedMemberId: memberId,
          businessName: business.name
        }
      });

      // Notify the removed member
      await sendNotification({
        user: new mongoose.Types.ObjectId(memberId),
        message: `You have been removed from "${business.name}"`,
        type: 'REMOVED_FROM_BUSINESS',
        data: { businessId }
      });

      res.json({
        success: true,
        message: 'Member removed successfully'
      });
    } catch (error) {
      next(error);
    }
  },

  // Get member quotas (from original controller)
  async getMemberQuotas(req: Request, res: Response, next: NextFunction) {
    try {
      const { businessId } = req.params;
      logger.info(`Getting member quotas for business: ${businessId}`);

      if (!mongoose.Types.ObjectId.isValid(businessId)) {
        throw new AppError(400, 'Invalid business ID format');
      }

      const business = await Business.findById(businessId)
        .populate('members.user', 'name email role')
        .populate('owner', 'name email');

      if (!business) {
        throw new AppError(404, 'Business not found');
      }

      // Check access
      const hasAccess = business.owner._id.toString() === req.user._id.toString() ||
        business.members.some((member: any) => member.user._id.toString() === req.user._id.toString());

      if (!hasAccess) {
        throw new AppError(403, 'Not authorized to view this business');
      }

      const memberQuotas = business.members.map((member: any) => {
        const isOwner = member.user._id.toString() === business.owner._id.toString();
        const memberRole = member.role || (isOwner ? 'owner' : 'member');

        // Role-based quotas
        let quotaLimits;
        switch (memberRole) {
          case Role.SuperAdmin:
          case 'owner':
            quotaLimits = {
              tasks: { limit: -1, used: 0 },
              projects: { limit: -1, used: 0 },
              storage: { limit: -1, used: 0 },
              members: { limit: -1, used: 0 }
            };
            break;
          case Role.Admin:
            quotaLimits = {
              tasks: { limit: 500, used: 0 },
              projects: { limit: 20, used: 0 },
              storage: { limit: 10240, used: 0 }, // 10GB
              members: { limit: 50, used: 0 }
            };
            break;
          case Role.Member:
            quotaLimits = {
              tasks: { limit: 100, used: 0 },
              projects: { limit: 5, used: 0 },
              storage: { limit: 2048, used: 0 }, // 2GB
              members: { limit: 0, used: 0 }
            };
            break;
          default:
            quotaLimits = {
              tasks: { limit: 50, used: 0 },
              projects: { limit: 2, used: 0 },
              storage: { limit: 1024, used: 0 }, // 1GB
              members: { limit: 0, used: 0 }
            };
        }

        return {
          memberId: member.user._id,
          memberName: member.user.name,
          memberEmail: member.user.email,
          role: memberRole,
          quotas: quotaLimits,
          isOwner
        };
      });

      res.json({
        success: true,
        data: {
          businessId: business._id,
          businessName: business.name,
          totalMembers: business.members.length,
          memberQuotas,
          businessLimits: {
            maxMembers: 1000,
            maxAdmins: 20,
            maxProjects: 100,
            maxStorageGB: 100
          }
        }
      });
    } catch (error) {
      next(error);
    }
  },

  // Get business analytics
  async getBusinessAnalytics(req: Request, res: Response, next: NextFunction) {
    try {
      const businessId = req.params.id;
      const { dateFrom, dateTo } = req.query;

      const business = await Business.findById(businessId);
      if (!business) {
        throw new AppError(404, 'Business not found');
      }

      const dateFilter: any = { business: businessId };
      if (dateFrom || dateTo) {
        dateFilter.createdAt = {};
        if (dateFrom) dateFilter.createdAt.$gte = new Date(dateFrom as string);
        if (dateTo) dateFilter.createdAt.$lte = new Date(dateTo as string);
      }

      const [
        projectStats,
        taskStats,
        memberStats,
        clientStats,
        revenueStats
      ] = await Promise.all([
        // Project analytics
        Project.aggregate([
          { $match: dateFilter },
          {
            $group: {
              _id: '$status',
              count: { $sum: 1 },
              totalBudget: { $sum: '$budget.total' }
            }
          }
        ]),
        // Task analytics
        Task.aggregate([
          { $match: dateFilter },
          {
            $group: {
              _id: null,
              total: { $sum: 1 },
              completed: { $sum: { $cond: [{ $eq: ['$status', 'Done'] }, 1, 0] } },
              overdue: {
                $sum: {
                  $cond: [
                    {
                      $and: [
                        { $lt: ['$dueDate', new Date()] },
                        { $ne: ['$status', 'Done'] }
                      ]
                    },
                    1,
                    0
                  ]
                }
              }
            }
          }
        ]),
        // Member performance
        User.aggregate([
          {
            $match: {
              $or: [
                { _id: business.owner },
                { _id: { $in: business.members.map((m: any) => m.user) } }
              ]
            }
          },
          {
            $lookup: {
              from: 'tasks',
              localField: '_id',
              foreignField: 'assignee',
              as: 'assignedTasks',
              pipeline: [{ $match: { business: businessId } }]
            }
          },
          {
            $project: {
              name: 1,
              email: 1,
              totalTasks: { $size: '$assignedTasks' },
              completedTasks: {
                $size: {
                  $filter: {
                    input: '$assignedTasks',
                    cond: { $eq: ['$$this.status', 'Done'] }
                  }
                }
              }
            }
          }
        ]),
        // Client analytics
        Client.aggregate([
          { $match: { business: businessId } },
          {
            $group: {
              _id: '$status',
              count: { $sum: 1 }
            }
          }
        ]),
        // Revenue analytics (from project budgets)
        Project.aggregate([
          { $match: { business: businessId, 'budget.total': { $exists: true } } },
          {
            $group: {
              _id: {
                year: { $year: '$createdAt' },
                month: { $month: '$createdAt' }
              },
              totalRevenue: { $sum: '$budget.total' },
              projectCount: { $sum: 1 }
            }
          },
          { $sort: { '_id.year': 1, '_id.month': 1 } }
        ])
      ]);

      res.json({
        success: true,
        data: {
          projects: projectStats,
          tasks: taskStats[0] || { total: 0, completed: 0, overdue: 0 },
          members: memberStats,
          clients: clientStats,
          revenue: revenueStats
        }
      });
    } catch (error) {
      next(error);
    }
  },

  // Delete business (owner only)
  async deleteBusiness(req: Request, res: Response, next: NextFunction) {
    try {
      const businessId = req.params.id;

      const business = await Business.findById(businessId);
      if (!business) {
        throw new AppError(404, 'Business not found');
      }

      // Check permissions
      if (business.owner.toString() !== req.user._id.toString() && req.user.role !== 'super_admin') {
        throw new AppError(403, 'Only business owner or super admin can delete business');
      }

      // Delete all related data
      await Promise.all([
        Task.deleteMany({ business: businessId }),
        Project.deleteMany({ business: businessId }),
        Client.deleteMany({ business: businessId }),
        Invitation.deleteMany({ business: businessId }),
        AdminRequest.deleteMany({ business: businessId }),
        AuditLog.deleteMany({ business: businessId })
      ]);

      // Delete business
      await business.deleteOne();

      res.json({
        success: true,
        message: 'Business and all related data deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }
};