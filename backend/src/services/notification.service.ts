import { Notification } from '../models/notification.model';
import { User } from '../models/user.model';
import { Role } from '../types/enums';
import { prioritizeNotifications } from '../services/ai.service';
import type { Types } from 'mongoose';

interface CreateNotificationParams {
  user: Types.ObjectId;
  message: string;
  type: string;
  data?: Record<string, any>;
}

interface NotificationPayload {
  title: string;
  message: string;
  type: string;
  data?: Record<string, any>;
}

export const sendNotification = async ({
  user,
  message,
  type,
  data
}: CreateNotificationParams) => {
  try {
    // Create notification
    const notification = await Notification.create({
      user,
      message,
      type,
      data,
      priority: 0, // Default priority, will be updated by AI
      read: false
    });

    // Get user's recent notifications for context
    const recentNotifications = await Notification.find({ user })
      .sort({ createdAt: -1 })
      .limit(10);

    // Use AI to prioritize notifications
    const prioritizedNotifications = await prioritizeNotifications({
      notifications: recentNotifications.map(n => ({
        id: n._id.toString(),
        message: n.message,
        type: n.type,
        timestamp: n.createdAt.toISOString()
      }))
    });

    // Update priorities
    await Promise.all(
      prioritizedNotifications.map(async (pn) => {
        await Notification.findByIdAndUpdate(pn.id, {
          priority: pn.priorityScore
        });
      })
    );

    // Emit socket event if needed
    // global.io.to(user.toString()).emit('notification', notification);

    return notification;
  } catch (error) {
    console.error('Error sending notification:', error);
    throw error;
  }
};

export const markNotificationRead = async (notificationId: string) => {
  return Notification.findByIdAndUpdate(notificationId, { read: true });
};

export class NotificationService {
  async notifyAdmins(notification: NotificationPayload) {
    try {
      const admins = await User.find({ role: Role.Admin });
      for (const admin of admins) {
        await this.notify(admin._id, notification);
      }
    } catch (error) {
      console.error('Error notifying admins:', error);
    }
  }

  async notify(userId: Types.ObjectId, notification: NotificationPayload) {
    return sendNotification({
      user: userId,
      message: notification.message,
      type: notification.type,
      data: notification.data
    });
  }
}