import mongoose from 'mongoose';
import { Priority, TaskStatus } from '../types/enums';

export interface ITask {
  title: string;
  description?: string;
  project: mongoose.Types.ObjectId;
  assignee: mongoose.Types.ObjectId;
  priority: Priority;
  status: TaskStatus;
  dueDate: Date;
  attachments?: string[];
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const taskSchema = new mongoose.Schema<ITask>({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  assignee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  priority: {
    type: String,
    enum: ['Urgent', 'High', 'Medium', 'Low', 'None'],
    default: 'Medium'
  },
  status: {
    type: String,
    enum: ['Backlog', 'Todo', 'In Progress', 'In Review', 'Done', 'Cancelled'],
    default: 'Todo'
  },
  dueDate: {
    type: Date,
    required: true
  },
  attachments: [String],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Indexes
taskSchema.index({ project: 1 });
taskSchema.index({ assignee: 1 });
taskSchema.index({ status: 1 });
taskSchema.index({ priority: 1 });
taskSchema.index({ dueDate: 1 });

export const Task = mongoose.model<ITask>('Task', taskSchema);