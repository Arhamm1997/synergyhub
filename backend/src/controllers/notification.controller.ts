import { Request, Response, NextFunction } from 'express';
import { Notification } from '../models/notification.model';
import { AppError } from '../middleware/error-handler';
import { prioritizeNotifications } from '../services/ai.service';

export const notificationController = {
  // Get all notifications for current user
  async getNotifications(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user._id;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const skip = (page - 1) * limit;

      const notifications = await Notification.find({ user: userId })
        .sort({ priority: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('user', 'name avatarUrl');

      const totalNotifications = await Notification.countDocuments({ user: userId });
      const unreadCount = await Notification.countDocuments({ user: userId, read: false });

      res.json({
        success: true,
        data: {
          notifications,
          pagination: {
            currentPage: page,
            totalPages: Math.ceil(totalNotifications / limit),
            totalNotifications,
            unreadCount
          }
        }
      });
    } catch (error) {
      next(error);
    }
  },

  // Mark notification as read
  async markAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      const notificationId = req.params.id;
      const userId = req.user._id;

      const notification = await Notification.findOneAndUpdate(
        { _id: notificationId, user: userId },
        { read: true },
        { new: true }
      );

      if (!notification) {
        throw new AppError(404, 'Notification not found');
      }

      res.json({
        success: true,
        data: notification
      });
    } catch (error) {
      next(error);
    }
  },

  // Mark all notifications as read
  async markAllAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user._id;

      await Notification.updateMany(
        { user: userId, read: false },
        { read: true }
      );

      res.json({
        success: true,
        message: 'All notifications marked as read'
      });
    } catch (error) {
      next(error);
    }
  },

  // Delete notification
  async deleteNotification(req: Request, res: Response, next: NextFunction) {
    try {
      const notificationId = req.params.id;
      const userId = req.user._id;

      const notification = await Notification.findOneAndDelete({
        _id: notificationId,
        user: userId
      });

      if (!notification) {
        throw new AppError(404, 'Notification not found');
      }

      res.json({
        success: true,
        message: 'Notification deleted'
      });
    } catch (error) {
      next(error);
    }
  },

  // Prioritize notifications using AI
  async prioritizeNotifications(req: Request, res: Response, next: NextFunction) {
    try {
      const { notifications } = req.body;
      const userId = req.user._id;

      if (!Array.isArray(notifications)) {
        throw new AppError(400, 'Notifications must be an array');
      }

      // Get user's notifications to prioritize
      const userNotifications = await Notification.find({
        user: userId,
        _id: { $in: notifications }
      });

      if (userNotifications.length === 0) {
        throw new AppError(404, 'No notifications found');
      }

      // Use AI service to prioritize
      const prioritizedNotifications = await prioritizeNotifications({
        notifications: userNotifications.map(n => ({
          id: n._id.toString(),
          message: n.message,
          type: n.type,
          timestamp: n.createdAt.toISOString()
        }))
      });

      // Update notification priorities
      await Promise.all(
        prioritizedNotifications.map(async (pn) => {
          await Notification.findByIdAndUpdate(pn.id, {
            priority: pn.priorityScore
          });
        })
      );

      // Fetch updated notifications
      const updatedNotifications = await Notification.find({
        _id: { $in: notifications },
        user: userId
      }).sort({ priority: -1, createdAt: -1 });

      res.json({
        success: true,
        data: updatedNotifications
      });
    } catch (error) {
      next(error);
    }
  }
};