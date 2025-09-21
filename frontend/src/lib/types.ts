

import type { LucideIcon } from "lucide-react";
import type { Table } from "@tanstack/react-table";
import type { Event } from 'react-big-calendar';

export enum Role {
  SuperAdmin = "SuperAdmin",
  Admin = "Admin",
  Member = "Member",
  Client = "Client"
}

export interface BusinessQuotas {
  maxAdmins: number;
  maxMembers: number;
  currentAdmins: number;
  currentMembers: number;
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
  name:string;
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

export interface Member {
    id: string;
    name: string;
    role: Role;
    department: Department;
    email: string;
    avatarUrl: string;
    avatarHint: string;
    details?: string;
    permissions?: string[];
    status: UserStatus;
    lastActive?: Date;
}

export interface Business {
  id: string;
  name: string;
  owner: Assignee;
  phone: string;
  type: string;
  status: 'Active' | 'Inactive' | 'Lead';
  notes: string;
  quotas: BusinessQuotas;
  members: Member[];
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
