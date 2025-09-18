import type { LucideIcon } from "lucide-react";
import type { Table } from "@tanstack/react-table";
import type { Event } from 'react-big-calendar';

export type Priority = "High" | "Medium" | "Low";
export type TaskStatus = "Todo" | "In Progress" | "Done" | "Cancelled";

export interface Task {
  id: string;
  title: string;
  description?: string;
  assignee: {
    name: string;
    avatarUrl: string;
    avatarHint: string;
  };
  priority: Priority;
  status: TaskStatus;
  dueDate: string;
}

export interface TaskEvent extends Event {
    resource: Task;
}


export interface SummaryStat {
  title: string;
  value: string;
  description: string;
  icon: LucideIcon;
}
