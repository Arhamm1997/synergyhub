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

export type Department = string;

export enum Role {
  Admin = 'Admin',
  TeamLead = 'Team Lead',
  Employee = 'Employee',
  Client = 'Client'
}