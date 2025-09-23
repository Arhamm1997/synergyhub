export enum Priority {
  Urgent = 'Urgent',
  High = 'High',
  Medium = 'Medium',
  Low = 'Low',
  None = 'None'
}

export enum TaskStatus {
  Backlog = 'Backlog',
  Todo = 'Todo',
  InProgress = 'In Progress',
  InReview = 'In Review',
  Done = 'Done',
  Cancelled = 'Cancelled'
}

export enum ProjectStatus {
  NotStarted = 'Not Started',
  InProgress = 'In Progress',
  OnHold = 'On Hold',
  Completed = 'Completed',
  Cancelled = 'Cancelled'
}

export enum ClientStatus {
  Lead = 'Lead',
  Active = 'Active',
  OnHold = 'On Hold',
  Completed = 'Completed',
  Cancelled = 'Cancelled'
}

export enum UserStatus {
  Online = 'Online',
  Offline = 'Offline',
  Away = 'Away'
}

export enum Department {
  Engineering = 'Engineering',
  Design = 'Design',
  Marketing = 'Marketing',
  Sales = 'Sales',
  Management = 'Management',
  Operations = 'Operations',
  HR = 'HR',
  Finance = 'Finance',
  Other = 'Other'
}

export enum Role {
  SuperAdmin = 'SuperAdmin',
  Admin = 'Admin',
  Member = 'Member',
  Client = 'Client'
}

export enum TaskPermission {
  ViewTask = 'view_task',
  EditTask = 'edit_task',
  DeleteTask = 'delete_task',
  AssignTask = 'assign_task',
  ReadComments = 'read_comments',
  WriteComments = 'write_comments'
}

export enum AdminPermission {
  ManageAdmins = 'manage_admins',
  ManageMembers = 'manage_members',
  ManageRoles = 'manage_roles',
  ManagePermissions = 'manage_permissions',
  ViewAuditLogs = 'view_audit_logs'
}

export type Permission = TaskPermission | AdminPermission;

export const DEFAULT_ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  [Role.SuperAdmin]: [
    TaskPermission.ViewTask,
    TaskPermission.EditTask,
    TaskPermission.DeleteTask,
    TaskPermission.AssignTask,
    TaskPermission.ReadComments,
    TaskPermission.WriteComments,
    AdminPermission.ManageAdmins,
    AdminPermission.ManageMembers,
    AdminPermission.ManageRoles,
    AdminPermission.ManagePermissions,
    AdminPermission.ViewAuditLogs
  ],
  [Role.Admin]: [
    TaskPermission.ViewTask,
    TaskPermission.EditTask,
    TaskPermission.DeleteTask,
    TaskPermission.AssignTask,
    TaskPermission.ReadComments,
    TaskPermission.WriteComments,
    AdminPermission.ManageMembers,
    AdminPermission.ViewAuditLogs
  ],
  [Role.Member]: [
    TaskPermission.ViewTask,
    TaskPermission.ReadComments,
    TaskPermission.WriteComments
  ],
  [Role.Client]: [
    TaskPermission.ViewTask
  ]
}