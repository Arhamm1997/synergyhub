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

export enum Permission {
  ManageAdmins = 'manage_admins',
  ManageMembers = 'manage_members',
  ManageClients = 'manage_clients',
  ManageProjects = 'manage_projects',
  ManageTasks = 'manage_tasks',
  EditTasks = 'edit_tasks',
  ViewTasks = 'view_tasks',
  ManageMessages = 'manage_messages',
  SendMessages = 'send_messages',
  UploadFiles = 'upload_files'
}