import { Role, TaskPermission, AdminPermission } from './types';

export const ROLE_PERMISSIONS = {
  [Role.SuperAdmin]: [
    // Task Permissions
    TaskPermission.ViewTask,
    TaskPermission.EditTask,
    TaskPermission.DeleteTask,
    TaskPermission.AssignTask,
    TaskPermission.ReadComments,
    TaskPermission.WriteComments,
    // Admin Permissions
    AdminPermission.ManageAdmins,
    AdminPermission.ManageMembers,
    AdminPermission.ManageRoles,
    AdminPermission.ManagePermissions,
    AdminPermission.ViewAuditLogs
  ],
  [Role.Admin]: [
    // Task Permissions
    TaskPermission.ViewTask,
    TaskPermission.EditTask,
    TaskPermission.DeleteTask,
    TaskPermission.AssignTask,
    TaskPermission.ReadComments,
    TaskPermission.WriteComments,
    // Limited Admin Permissions
    AdminPermission.ManageMembers,
    AdminPermission.ViewAuditLogs
  ],
  [Role.Member]: [
    // Basic Task Permissions
    TaskPermission.ViewTask,
    TaskPermission.ReadComments,
    TaskPermission.WriteComments
  ],
  [Role.Client]: [
    // View-only Permissions
    TaskPermission.ViewTask,
    TaskPermission.ReadComments
  ]
};

export function hasPermission(userRole: Role, permission: string): boolean {
  return ROLE_PERMISSIONS[userRole]?.includes(permission) || false;
}

export function canManageRole(userRole: Role, targetRole: Role): boolean {
  // SuperAdmin can manage all roles except SuperAdmin
  if (userRole === Role.SuperAdmin && targetRole !== Role.SuperAdmin) {
    return true;
  }
  
  // Admin can only manage Members and Clients
  if (userRole === Role.Admin && (targetRole === Role.Member || targetRole === Role.Client)) {
    return true;
  }
  
  return false;
}

export function canSendInvite(userRole: Role, inviteRole: Role): boolean {
  // Only SuperAdmin can invite other Admins
  if (inviteRole === Role.Admin) {
    return userRole === Role.SuperAdmin;
  }
  
  // Both SuperAdmin and Admin can invite Members and Clients
  if (inviteRole === Role.Member || inviteRole === Role.Client) {
    return userRole === Role.SuperAdmin || userRole === Role.Admin;
  }
  
  return false;
}