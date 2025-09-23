

import type { LucideIcon } from "lucide-react";
import type { Table } from "@tanstack/react-table";
import type { Event } from 'react-big-calendar';

export enum Role {
  SuperAdmin = "SuperAdmin",
  Admin = "Admin",
  Member = "Member",
  Client = "Client"
}

export enum AdminPermission {
  ManageAdmins = "manage_admins",
  ManageMembers = "manage_members",
  ManageRoles = "manage_roles",
  ManagePermissions = "manage_permissions",
  ViewAuditLogs = "view_audit_logs"
}

export enum TaskPermission {
  ViewTask = "view_task",
  EditTask = "edit_task",
  DeleteTask = "delete_task",
  AssignTask = "assign_task",
  ReadComments = "read_comments",
  WriteComments = "write_comments"
}

export const DEFAULT_ROLE_PERMISSIONS = {
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

export interface BusinessQuotas {
  maxAdmins: number;
  maxMembers: number;
  currentAdmins: number;
  currentMembers: number;
}

export interface MemberQuota {
  total: number;
  used: number;
  remaining: number;
}

export type Priority = "Urgent" | "High" | "Medium" | "Low" | "None";
export type TaskStatus = "Backlog" | "Todo" | "In Progress" | "In Review" | "Done" | "Cancelled";
export type ProjectStatus = "Not Started" | "In Progress" | "On Hold" | "Completed" | "Cancelled";
export type ClientStatus = "Lead" | "Active" | "On Hold" | "Completed" | "Cancelled";
export type UserStatus = "Online" | "Away" | "Offline";
export type Department = string;

export interface Assignee {
  name: string;
  avatarUrl: string;
  avatarHint: string;
}

export interface Contact {
  id: string;
  name: string;
  avatarUrl?: string;
  avatarHint?: string;
  isGroup?: boolean;
  lastMessage?: string;
  time?: string;
  unread?: number;
  status?: UserStatus;
}


export interface Task {
  id: string;
  title: string;
  description?: string;
  assignee: Assignee;
  priority: Priority;
  status: TaskStatus;
  dueDate: string;
}

// Task operation types
export interface CreateTaskData {
  title: string;
  description?: string;
  projectId?: string;
  businessId?: string;
  assigneeId?: string;
  priority?: Priority;
  status?: TaskStatus;
  dueDate?: string;
  estimatedHours?: number;
  tags?: string[];
}

export interface UpdateTaskData {
  title?: string;
  description?: string;
  assigneeId?: string;
  priority?: Priority;
  status?: TaskStatus;
  dueDate?: string;
  estimatedHours?: number;
  tags?: string[];
  progress?: number;
}

export interface Project {
  id: string;
  name: string;
  client: string;
  status: ProjectStatus;
  progress: number;
  deadline: string;
  team: Assignee[];
  tasks: Task[];
  description?: string;
}

export interface Client {
  id: string;
  name: string;
  logoUrl: string;
  logoHint: string;
  project: string;
  status: ClientStatus;
  progress?: number;
  assignees: Assignee[];
  services?: string[];
}

export interface User {
  id: string;
  name: string;
  role: Role;
  department?: Department;
  email: string;
  avatarUrl?: string;
  avatarHint?: string;
  details?: string;
  permissions?: string[];
  status: UserStatus;
  lastActive?: Date;
}

export interface Member extends User {
  business: string;
}

export interface AdminUser extends Member {
  lastLogin?: Date;
  createdBy?: string;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

export interface AdminInvitation {
  id: string;
  email: string;
  role: Role;
  invitedBy: string;
  invitedAt: Date;
  expiresAt: Date;
  status: 'pending' | 'accepted' | 'expired';
}

export interface AdminAuditLog {
  id: string;
  action: string;
  performedBy: string;
  targetUser?: string;
  details: string;
  timestamp: Date;
}

export interface BusinessMember {
  user: User;
  role: Role;
  addedAt: Date;
}

export interface BusinessMemberCounts {
  superAdmin: number;
  admin: number;
  member: number;
  client: number;
}

export interface Business {
  id: string;
  name: string;
  description: string;
  owner: User;
  members: BusinessMember[];
  memberCounts: BusinessMemberCounts;
  phone?: string;
  type?: string;
  status: 'Active' | 'Inactive' | 'Lead';
  notes?: string;
  createdBy: User;
  createdAt: Date;
  updatedAt: Date;
}


export interface TaskEvent extends Event {
  resource: Task;
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  description?: string;
}

export interface SummaryStat {
  title: string;
  value: string;
  description: string;
  icon: LucideIcon;
}
