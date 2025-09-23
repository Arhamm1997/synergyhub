import mongoose, { Document } from 'mongoose';

export enum AdminRequestStatus {
  Pending = 'pending',
  Approved = 'approved',
  Rejected = 'rejected'
}

export interface IAdminRequest extends Document {
  user: mongoose.Types.ObjectId;
  business: mongoose.Types.ObjectId;
  message?: string;
  status: AdminRequestStatus;
  requestedAt: Date;
  processedAt?: Date;
  processedBy?: mongoose.Types.ObjectId;
  reason?: string;
}

const adminRequestSchema = new mongoose.Schema<IAdminRequest>({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  business: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Business',
    required: true
  },
  message: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: Object.values(AdminRequestStatus),
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