import mongoose, { Document } from 'mongoose';
import { Role, UserStatus } from '../types/enums';

export enum AdminRequestStatus {
  Pending = 'Pending',
  Approved = 'Approved',
  Rejected = 'Rejected'
}

export interface IAdminRequest extends Document {
  name: string;
  email: string;
  hashedPassword: string;
  status: AdminRequestStatus;
  requestedAt: Date;
  processedAt?: Date;
  processedBy?: mongoose.Types.ObjectId;
  reason?: string;
}

const adminRequestSchema = new mongoose.Schema<IAdminRequest>({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  hashedPassword: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: AdminRequestStatus,
    default: AdminRequestStatus.Pending
  },
  requestedAt: {
    type: Date,
    default: Date.now
  },
  processedAt: Date,
  processedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reason: String
}, {
  timestamps: true
});

export const AdminRequest = mongoose.model<IAdminRequest>('AdminRequest', adminRequestSchema);