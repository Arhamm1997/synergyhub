import { Request, Response, NextFunction } from 'express';
import { Permission, Role } from '../types/enums';
import { Business, IBusiness } from '../models/business.model';
import { Types } from 'mongoose';

interface BusinessMember {
  user: Types.ObjectId;
  role: Role;
  addedAt: Date;
}

// Define role permissions
const rolePermissions = {
  [Role.SuperAdmin]: Object.values(Permission),
  [Role.Admin]: [
    Permission.ManageMembers,
    Permission.ManageClients,
    Permission.ManageProjects,
    Permission.ManageTasks,
    Permission.EditTasks,
    Permission.ViewTasks,
    Permission.ManageMessages,
    Permission.SendMessages,
    Permission.UploadFiles
  ],
  [Role.Member]: [
    Permission.EditTasks,
    Permission.ViewTasks,
    Permission.SendMessages,
    Permission.UploadFiles
  ],
  [Role.Client]: [
    Permission.ViewTasks,
    Permission.SendMessages,
    Permission.UploadFiles
  ]
};

// Check if user has required permissions
export const hasPermission = (requiredPermissions: Permission[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user;
      const businessId = req.params.businessId || req.body.businessId;

      if (!user || !businessId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      // Get user's role in the business
      const business = await Business.findById(businessId);
      if (!business) {
        return res.status(404).json({ message: 'Business not found' });
      }

      const memberRecord = business.members.find(
        m => m.user.toString() === user._id.toString()
      );

      if (!memberRecord) {
        return res.status(403).json({ message: 'Access denied' });
      }

      const userPermissions = rolePermissions[memberRecord.role];
      const hasAllPermissions = requiredPermissions.every(
        permission => userPermissions.includes(permission)
      );

      if (!hasAllPermissions) {
        return res.status(403).json({ message: 'Insufficient permissions' });
      }

      // Add permissions to request for use in controllers
      req.userPermissions = userPermissions;
      req.userRole = memberRecord.role;
      
      next();
    } catch (error) {
      next(error);
    }
  };
};

// Check if user can manage roles
export const canManageRole = (targetRole: Role) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user;
      const businessId = req.params.businessId || req.body.businessId;

      if (!user || !businessId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const business = await Business.findById(businessId);
      if (!business) {
        return res.status(404).json({ message: 'Business not found' });
      }

      const memberRecord = business.members.find(
        m => m.user.toString() === user._id.toString()
      );

      if (!memberRecord) {
        return res.status(403).json({ message: 'Access denied' });
      }

      // Only SuperAdmin can manage Admins
      if (targetRole === Role.Admin && memberRecord.role !== Role.SuperAdmin) {
        return res.status(403).json({ message: 'Only Super Admins can manage Admins' });
      }

      // Check role quotas
      if (targetRole === Role.Admin && business.memberCounts.admin >= 20) {
        return res.status(403).json({ message: 'Maximum number of Admins reached (20)' });
      }

      if (targetRole === Role.Member && business.memberCounts.member >= 1000) {
        return res.status(403).json({ message: 'Maximum number of Members reached (1000)' });
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      userPermissions?: Permission[];
      userRole?: Role;
    }
  }
}