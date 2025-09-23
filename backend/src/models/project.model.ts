import mongoose from 'mongoose';
import { ProjectStatus } from '../types/enums';

export interface IProjectMilestone {
  title: string;
  description?: string;
  dueDate: Date;
  completed: boolean;
  completedAt?: Date;
  completedBy?: mongoose.Types.ObjectId;
}

export interface IProjectBudget {
  total: number;
  spent: number;
  currency: string;
}

export interface IProjectTeamMember {
  user: mongoose.Types.ObjectId;
  role: string; // Project role (e.g., "Project Manager", "Developer", "Designer")
  hourlyRate?: number;
  addedAt: Date;
}

export interface IProject {
  name: string;
  client: mongoose.Types.ObjectId;
  business: mongoose.Types.ObjectId;
  status: ProjectStatus;
  progress: number;
  deadline: Date;
  startDate: Date;
  team: IProjectTeamMember[];
  description?: string;
  budget?: IProjectBudget;
  milestones?: IProjectMilestone[];
  tags?: string[];
  customFields?: Record<string, any>;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  visibility: 'Private' | 'Team' | 'Public';
  estimatedHours?: number;
  actualHours?: number;
  completionPercentage: number;
  projectManager?: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const milestoneSchema = new mongoose.Schema<IProjectMilestone>({
  title: {
    type: String,
    required: true
  },
  description: String,
  dueDate: {
    type: Date,
    required: true
  },
  completed: {
    type: Boolean,
    default: false
  },
  completedAt: Date,
  completedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
});

const teamMemberSchema = new mongoose.Schema<IProjectTeamMember>({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  role: {
    type: String,
    required: true,
    default: 'Team Member'
  },
  hourlyRate: Number,
  addedAt: {
    type: Date,
    default: Date.now
  }
});

const budgetSchema = new mongoose.Schema<IProjectBudget>({
  total: {
    type: Number,
    required: true,
    min: 0
  },
  spent: {
    type: Number,
    default: 0,
    min: 0
  },
  currency: {
    type: String,
    default: 'USD'
  }
});

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
  business: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Business',
    required: true
  },
  status: {
    type: String,
    enum: Object.values(ProjectStatus),
    default: ProjectStatus.NotStarted
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
  startDate: {
    type: Date,
    required: true
  },
  team: [teamMemberSchema],
  description: String,
  budget: budgetSchema,
  milestones: [milestoneSchema],
  tags: [String],
  customFields: {
    type: mongoose.Schema.Types.Mixed
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Medium'
  },
  visibility: {
    type: String,
    enum: ['Private', 'Team', 'Public'],
    default: 'Team'
  },
  estimatedHours: {
    type: Number,
    min: 0
  },
  actualHours: {
    type: Number,
    min: 0
  },
  completionPercentage: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  projectManager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
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

// Virtual for budget utilization percentage
projectSchema.virtual('budgetUtilization').get(function () {
  if (!this.budget || this.budget.total === 0) return 0;
  return Math.round((this.budget.spent / this.budget.total) * 100);
});

// Virtual for completed milestones count
projectSchema.virtual('completedMilestones').get(function () {
  if (!this.milestones) return 0;
  return this.milestones.filter(milestone => milestone.completed).length;
});

// Virtual for total milestones count
projectSchema.virtual('totalMilestones').get(function () {
  return this.milestones ? this.milestones.length : 0;
});

// Include virtuals in JSON
projectSchema.set('toJSON', { virtuals: true });
projectSchema.set('toObject', { virtuals: true });

// Indexes for better performance
projectSchema.index({ name: 1 });
projectSchema.index({ client: 1 });
projectSchema.index({ business: 1 });
projectSchema.index({ deadline: 1 });
projectSchema.index({ status: 1 });
projectSchema.index({ priority: 1 });
projectSchema.index({ tags: 1 });
projectSchema.index({ 'team.user': 1 });
projectSchema.index({ projectManager: 1 });
projectSchema.index({ createdAt: -1 });

// Pre-save middleware to update progress based on milestones
projectSchema.pre('save', function (next) {
  if (this.milestones && this.milestones.length > 0) {
    const completedCount = this.milestones.filter(milestone => milestone.completed).length;
    this.completionPercentage = Math.round((completedCount / this.milestones.length) * 100);
  }

  // Auto-set project manager from team if not set
  if (!this.projectManager && this.team && this.team.length > 0) {
    const manager = this.team.find(member =>
      member.role.toLowerCase().includes('manager') ||
      member.role.toLowerCase().includes('lead')
    );
    if (manager) {
      this.projectManager = manager.user;
    }
  }

  next();
});

export const Project = mongoose.model<IProject>('Project', projectSchema);