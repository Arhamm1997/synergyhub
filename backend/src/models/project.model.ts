import mongoose from 'mongoose';
import { ProjectStatus } from '../types/enums';

export interface IProject {
  name: string;
  client: mongoose.Types.ObjectId;
  status: ProjectStatus;
  progress: number;
  deadline: Date;
  team: mongoose.Types.ObjectId[];
  description?: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const projectSchema = new mongoose.Schema<IProject>({
  name: {
    type: String,
    required: true,
    trim: true
  },
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: true
  },
  status: {
    type: String,
    enum: ['Not Started', 'In Progress', 'On Hold', 'Completed', 'Cancelled'],
    default: 'Not Started'
  },
  progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  deadline: {
    type: Date,
    required: true
  },
  team: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  description: String,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Virtual populate tasks
projectSchema.virtual('tasks', {
  ref: 'Task',
  localField: '_id',
  foreignField: 'project'
});

// Include virtuals in JSON
projectSchema.set('toJSON', { virtuals: true });
projectSchema.set('toObject', { virtuals: true });

// Indexes
projectSchema.index({ name: 1 });
projectSchema.index({ client: 1 });
projectSchema.index({ deadline: 1 });
projectSchema.index({ status: 1 });

export const Project = mongoose.model<IProject>('Project', projectSchema);