import mongoose, { Document, Schema } from 'mongoose';
import { Role } from '../types/enums';

export interface IInvitation extends Document {
  email: string;
  token: string;
  invitedBy: mongoose.Types.ObjectId;
  status: 'pending' | 'accepted' | 'expired';
  business: mongoose.Types.ObjectId;
  role: Role;
  message?: string;
  expiresAt: Date;
  acceptedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const InvitationSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    token: {
      type: String,
      required: true,
      unique: true,
    },
    invitedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'expired'],
      default: 'pending',
    },
    business: {
      type: Schema.Types.ObjectId,
      ref: 'Business',
      required: true,
    },
    role: {
      type: String,
      enum: Object.values(Role),
      required: true,
      default: Role.Member,
    },
    message: {
      type: String,
      trim: true
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    acceptedAt: {
      type: Date
    }
  },
  {
    timestamps: true,
  }
);

// Index to allow querying by token
InvitationSchema.index({ token: 1 });
// Index to allow querying by email and business
InvitationSchema.index({ email: 1, business: 1 });
// Index for expiry cleanup
InvitationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const Invitation = mongoose.model<IInvitation>('Invitation', InvitationSchema);