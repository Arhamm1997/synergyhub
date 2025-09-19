import mongoose from 'mongoose';
import { ClientStatus } from '../types/enums';

export interface IClient {
  name: string;
  logoUrl: string;
  logoHint: string;
  status: ClientStatus;
  progress?: number;
  assignees: mongoose.Types.ObjectId[];
  services: string[];
  contactInfo: {
    email?: string;
    phone?: string;
    address?: string;
  };
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const clientSchema = new mongoose.Schema<IClient>({
  name: {
    type: String,
    required: true,
    trim: true
  },
  logoUrl: {
    type: String,
    required: true
  },
  logoHint: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: Object.values(ClientStatus),
    default: ClientStatus.Lead
  },
  progress: {
    type: Number,
    min: 0,
    max: 100
  },
  assignees: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  services: [String],
  contactInfo: {
    email: String,
    phone: String,
    address: String
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Virtual populate projects
clientSchema.virtual('projects', {
  ref: 'Project',
  localField: '_id',
  foreignField: 'client'
});

// Include virtuals in JSON
clientSchema.set('toJSON', { virtuals: true });
clientSchema.set('toObject', { virtuals: true });

// Indexes
clientSchema.index({ name: 1 });
clientSchema.index({ status: 1 });
clientSchema.index({ 'contactInfo.email': 1 });

export const Client = mongoose.model<IClient>('Client', clientSchema);