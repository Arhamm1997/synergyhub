import mongoose from 'mongoose';

export interface INotification {
  user: mongoose.Types.ObjectId;
  message: string;
  type: string;
  priority: number;
  read: boolean;
  data?: Record<string, any>;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new mongoose.Schema<INotification>({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true
  },
  priority: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  read: {
    type: Boolean,
    default: false
  },
  data: {
    type: mongoose.Schema.Types.Mixed
  },
  expiresAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Index for efficient querying
notificationSchema.index({ user: 1, read: 1 });
notificationSchema.index({ user: 1, createdAt: -1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Clean up expired notifications
notificationSchema.pre('save', function(next) {
  if (!this.expiresAt) {
    // Set default expiration to 30 days from now
    this.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  }
  next();
});

export const Notification = mongoose.model<INotification>('Notification', notificationSchema);