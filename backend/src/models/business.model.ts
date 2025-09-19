import mongoose from 'mongoose';

export interface IBusiness {
  name: string;
  description: string;
  owner: mongoose.Types.ObjectId;
  members: mongoose.Types.ObjectId[];
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
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
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