import mongoose from 'mongoose';
import { Priority, TaskStatus } from '../types/enums';

export interface ITaskComment {
  author: mongoose.Types.ObjectId;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  edited?: boolean;
}

export interface ITaskAttachment {
  filename: string;
  url: string;
  size: number;
  mimeType: string;
  uploadedBy: mongoose.Types.ObjectId;
  uploadedAt: Date;
}

export interface ITaskTimeEntry {
  user: mongoose.Types.ObjectId;
  startTime: Date;
  endTime?: Date;
  duration?: number; // in minutes
  description?: string;
}

export interface ITaskSubtask {
  title: string;
  completed: boolean;
  assignee?: mongoose.Types.ObjectId;
  completedBy?: mongoose.Types.ObjectId;
  completedAt?: Date;
}

export interface ITask {
  title: string;
  description?: string;
  project: mongoose.Types.ObjectId;
  assignee: mongoose.Types.ObjectId;
  priority: Priority;
  status: TaskStatus;
  dueDate: Date;
  startDate?: Date;
  estimatedHours?: number;
  actualHours?: number;
  tags?: string[];
  dependencies?: mongoose.Types.ObjectId[]; // Other tasks this depends on
  subtasks?: ITaskSubtask[];
  comments?: ITaskComment[];
  attachments?: ITaskAttachment[];
  timeEntries?: ITaskTimeEntry[];
  watchers?: mongoose.Types.ObjectId[]; // Users watching this task
  completedAt?: Date;
  completedBy?: mongoose.Types.ObjectId;
  labels?: string[];
  customFields?: Record<string, any>;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const timeEntrySchema = new mongoose.Schema<ITaskTimeEntry>({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: Date,
  duration: Number,
  description: String
});

const taskCommentSchema = new mongoose.Schema<ITaskComment>({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true
  },
  edited: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

const taskAttachmentSchema = new mongoose.Schema<ITaskAttachment>({
  filename: {
    type: String,
    required: true
  },
  url: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    required: true
  },
  mimeType: {
    type: String,
    required: true
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  }
});

const subtaskSchema = new mongoose.Schema<ITaskSubtask>({
  title: {
    type: String,
    required: true
  },
  completed: {
    type: Boolean,
    default: false
  },
  assignee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  completedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  completedAt: Date
});

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
    enum: Object.values(Priority),
    default: Priority.Medium
  },
  status: {
    type: String,
    enum: Object.values(TaskStatus),
    default: TaskStatus.Todo
  },
  dueDate: {
    type: Date,
    required: true
  },
  startDate: Date,
  estimatedHours: {
    type: Number,
    min: 0
  },
  actualHours: {
    type: Number,
    min: 0
  },
  tags: [String],
  dependencies: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task'
  }],
  subtasks: [subtaskSchema],
  comments: [taskCommentSchema],
  attachments: [taskAttachmentSchema],
  timeEntries: [timeEntrySchema],
  watchers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  completedAt: Date,
  completedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  labels: [String],
  customFields: {
    type: mongoose.Schema.Types.Mixed
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Indexes for better performance
taskSchema.index({ project: 1 });
taskSchema.index({ assignee: 1 });
taskSchema.index({ status: 1 });
taskSchema.index({ priority: 1 });
taskSchema.index({ dueDate: 1 });
taskSchema.index({ tags: 1 });
taskSchema.index({ labels: 1 });
taskSchema.index({ createdAt: -1 });
taskSchema.index({ 'watchers': 1 });

// Pre-save middleware to calculate actual hours from time entries
taskSchema.pre('save', function (next) {
  if (this.timeEntries && this.timeEntries.length > 0) {
    this.actualHours = this.timeEntries.reduce((total, entry) => {
      if (entry.duration) {
        return total + (entry.duration / 60); // Convert minutes to hours
      }
      return total;
    }, 0);
  }

  // Set completion date and user when status changes to Done
  if (this.isModified('status') && this.status === TaskStatus.Done && !this.completedAt) {
    this.completedAt = new Date();
    // completedBy should be set by the controller
  }

  next();
});

// Virtual for progress calculation based on subtasks
taskSchema.virtual('progress').get(function () {
  if (!this.subtasks || this.subtasks.length === 0) {
    return this.status === TaskStatus.Done ? 100 : 0;
  }

  const completedSubtasks = this.subtasks.filter(subtask => subtask.completed).length;
  return Math.round((completedSubtasks / this.subtasks.length) * 100);
});

// Include virtuals in JSON
taskSchema.set('toJSON', { virtuals: true });
taskSchema.set('toObject', { virtuals: true });

export const Task = mongoose.model<ITask>('Task', taskSchema);