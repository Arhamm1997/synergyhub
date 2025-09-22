import { Request, Response, NextFunction } from 'express';
import { Role } from '../types/enums';
import { ForbiddenError } from '../utils/errors';

export const requireRole = (allowedRoles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const userRole = req.user?.role;

    if (!userRole || !allowedRoles.includes(userRole)) {
      throw new ForbiddenError('You do not have permission to access this resource');
    }

    next();
  };
};

export const canManageRole = (userRole: Role, targetRole: Role): boolean => {
  // SuperAdmin can manage all roles except SuperAdmin
  if (userRole === Role.SuperAdmin && targetRole !== Role.SuperAdmin) {
    return true;
  }
  
  // Admin can only manage Members and Clients
  if (userRole === Role.Admin && (targetRole === Role.Member || targetRole === Role.Client)) {
    return true;
  }
  
  return false;
};

export const validateRoleManagement = (req: Request, res: Response, next: NextFunction) => {
  const userRole = req.user?.role;
  const targetRole = req.body.role;

  if (!userRole || !targetRole) {
    throw new ForbiddenError('Invalid role information');
  }

  if (!canManageRole(userRole, targetRole)) {
    throw new ForbiddenError('You do not have permission to manage this role');
  }

  next();
};