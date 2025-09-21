import mongoose from 'mongoose';

interface BusinessMember {
  user: mongoose.Types.ObjectId;
  role: 'SuperAdmin' | 'Admin' | 'Member' | 'Client';
  addedAt: Date;
}

interface MemberCounts {
  superAdmin: number;
  admin: number;
  member: number;
  client: number;
}

export interface IBusiness {
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

const businessSchema = new mongoose.Schema<IBusiness>({
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
      default: 1 // Owner is always super admin
    },
    admin: {
      type: Number,
      default: 0,
      max: 20 // Maximum 20 admins
    },
    member: {
      type: Number,
      default: 0,
      max: 1000 // Maximum 1000 members
    },
    client: {
      type: Number,
      default: 0
    }
  },
  members: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: {
      type: String,
      enum: ['SuperAdmin', 'Admin', 'Member', 'Client'],
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

// Indexes
businessSchema.index({ name: 1 });
businessSchema.index({ owner: 1 });
businessSchema.index({ status: 1 });
businessSchema.index({ type: 1 });

export const Business = mongoose.model<IBusiness>('Business', businessSchema);