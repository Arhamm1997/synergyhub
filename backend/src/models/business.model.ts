import mongoose, { Document } from 'mongoose';
import { Role } from '../types/enums';
import { AppError } from '../utils/errors';

interface BusinessMember {
  user: mongoose.Types.ObjectId;
  role: Role;
  addedAt: Date;
}

interface MemberCounts {
  superAdmin: number;
  admin: number;
  member: number;
  client: number;
}

export interface IBusiness extends Document {
  name: string;
  description: string;
  owner: mongoose.Types.ObjectId;
  members: BusinessMember[];
  memberCounts: MemberCounts;
  phone?: string;
  type?: string;
  status: 'Active' | 'Inactive' | 'Lead';
  notes?: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface IBusinessMethods {
  canAddMemberWithRole(role: Role): Promise<boolean>;
  addMember(userId: mongoose.Types.ObjectId, role: Role): Promise<void>;
  removeMember(userId: mongoose.Types.ObjectId): Promise<void>;
  updateMemberRole(userId: mongoose.Types.ObjectId, newRole: Role): Promise<void>;
}

type BusinessModel = mongoose.Model<IBusiness, Record<string, never>, IBusinessMethods>;

const businessSchema = new mongoose.Schema<IBusiness, BusinessModel, IBusinessMethods>({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  memberCounts: {
    superAdmin: {
      type: Number,
      default: 1,
      min: 1,
      max: 5
    },
    admin: {
      type: Number,
      default: 0,
      min: 0,
      max: 20
    },
    member: {
      type: Number,
      default: 0,
      min: 0,
      max: 1000
    },
    client: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  members: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    role: {
      type: String,
      enum: Object.values(Role),
      required: true
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  phone: {
    type: String,
    trim: true
  },
  type: {
    type: String
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive', 'Lead'],
    default: 'Lead'
  },
  notes: {
    type: String,
    trim: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Methods
businessSchema.method('canAddMemberWithRole', async function (role: Role): Promise<boolean> {
  const counts = this.memberCounts;

  switch (role) {
    case Role.SuperAdmin:
      return counts.superAdmin < 5;
    case Role.Admin:
      return counts.admin < 20;
    case Role.Member:
      return counts.member < 1000;
    case Role.Client:
      return true; // No limit on clients
    default:
      return false;
  }
});

businessSchema.method('addMember', async function (userId: mongoose.Types.ObjectId, role: Role): Promise<void> {
  if (!(await this.canAddMemberWithRole(role))) {
    throw new AppError(`Cannot add more members with role ${role}`, 400);
  }

  // Check if user is already a member
  if (this.members.some(m => m.user.equals(userId))) {
    throw new AppError('User is already a member of this business', 400);
  }

  // Add member and update counts
  this.members.push({ user: userId, role, addedAt: new Date() });
  this.memberCounts[role.toLowerCase() as keyof MemberCounts]++;
  await this.save();
});

businessSchema.method('removeMember', async function (userId: mongoose.Types.ObjectId): Promise<void> {
  const member = this.members.find(m => m.user.equals(userId));

  if (!member) {
    throw new AppError('Member not found', 404);
  }

  if (member.role === Role.SuperAdmin && this.memberCounts.superAdmin <= 1) {
    throw new AppError('Cannot remove the last SuperAdmin', 400);
  }

  // Remove member and update counts
  this.members = this.members.filter(m => !m.user.equals(userId));
  this.memberCounts[member.role.toLowerCase() as keyof MemberCounts]--;
  await this.save();
});

businessSchema.method('updateMemberRole', async function (userId: mongoose.Types.ObjectId, newRole: Role): Promise<void> {
  const member = this.members.find(m => m.user.equals(userId));

  if (!member) {
    throw new AppError('Member not found', 404);
  }

  if (member.role === Role.SuperAdmin && this.memberCounts.superAdmin <= 1 && newRole !== Role.SuperAdmin) {
    throw new AppError('Cannot change role of the last SuperAdmin', 400);
  }

  if (!(await this.canAddMemberWithRole(newRole))) {
    throw new AppError(`Cannot add more members with role ${newRole}`, 400);
  }

  // Update role and counts
  this.memberCounts[member.role.toLowerCase() as keyof MemberCounts]--;
  this.memberCounts[newRole.toLowerCase() as keyof MemberCounts]++;
  member.role = newRole;
  await this.save();
});

// Indexes
businessSchema.index({ name: 1 });
businessSchema.index({ owner: 1 });
businessSchema.index({ status: 1 });
businessSchema.index({ type: 1 });
businessSchema.index({ 'members.user': 1 });

// Pre-save hook to ensure owner is SuperAdmin
businessSchema.pre('save', function (next) {
  if (this.isNew) {
    const ownerMember = {
      user: this.owner,
      role: Role.SuperAdmin,
      addedAt: new Date()
    };
    this.members = [ownerMember];
  }
  next();
});

export const Business = mongoose.model<IBusiness, BusinessModel>('Business', businessSchema);