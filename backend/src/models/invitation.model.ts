import mongoose, { Document, Schema } from 'mongoose';

export interface Invitation extends Document {
  email: string;
  token: string;
  invitedBy: mongoose.Types.ObjectId;
  status: 'pending' | 'accepted' | 'expired';
  businessId: mongoose.Types.ObjectId;
  role: string;
  expiresAt: Date;
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
    businessId: {
      type: Schema.Types.ObjectId,
      ref: 'Business',
      required: true,
    },
    role: {
      type: String,
      required: true,
      default: 'member',
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index to allow querying by token
InvitationSchema.index({ token: 1 });
// Index to allow querying by email and business
InvitationSchema.index({ email: 1, businessId: 1 });
// Index for expiry cleanup
InvitationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const Invitation = mongoose.model<Invitation>('Invitation', InvitationSchema);