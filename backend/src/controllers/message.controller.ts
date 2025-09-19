import { Request, Response, NextFunction } from 'express';
import { Message } from '../models/message.model';
import { User } from '../models/user.model';
import { AppError } from '../middleware/error-handler';

export const messageController = {
  // Get all messages for current user
  async getMessages(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user._id;
      
      // Get conversations with other users
      const conversations = await Message.aggregate([
        {
          $match: {
            $or: [
              { sender: userId },
              { receiver: userId }
            ]
          }
        },
        {
          $sort: { createdAt: -1 }
        },
        {
          $group: {
            _id: {
              $cond: {
                if: { $eq: ['$sender', userId] },
                then: '$receiver',
                else: '$sender'
              }
            },
            lastMessage: { $first: '$$ROOT' },
            unreadCount: {
              $sum: {
                $cond: [
                  { $and: [{ $eq: ['$receiver', userId] }, { $eq: ['$read', false] }] },
                  1,
                  0
                ]
              }
            }
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: '_id',
            as: 'user'
          }
        },
        {
          $unwind: '$user'
        },
        {
          $project: {
            user: {
              _id: '$user._id',
              name: '$user.name',
              avatarUrl: '$user.avatarUrl',
              status: '$user.status'
            },
            lastMessage: 1,
            unreadCount: 1
          }
        }
      ]);

      res.json({
        success: true,
        data: conversations
      });
    } catch (error) {
      next(error);
    }
  },

  // Send a message
  async sendMessage(req: Request, res: Response, next: NextFunction) {
    try {
      const { receiver, content, attachments } = req.body;
      const sender = req.user._id;

      // Check if receiver exists
      const receiverUser = await User.findById(receiver);
      if (!receiverUser) {
        throw new AppError(404, 'Receiver not found');
      }

      const message = await Message.create({
        sender,
        receiver,
        content,
        attachments: attachments || []
      });

      await message.populate([
        { path: 'sender', select: 'name avatarUrl' },
        { path: 'receiver', select: 'name avatarUrl' }
      ]);

      // Emit socket event if available
      if ((global as any).io) {
        (global as any).io.to(receiver.toString()).emit('new-message', message);
      }

      res.status(201).json({
        success: true,
        data: message
      });
    } catch (error) {
      next(error);
    }
  },

  // Get conversation between current user and another user
  async getConversation(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user._id;
      const otherUserId = req.params.id;

      // Check if other user exists
      const otherUser = await User.findById(otherUserId);
      if (!otherUser) {
        throw new AppError(404, 'User not found');
      }

      // Get messages between users
      const messages = await Message.find({
        $or: [
          { sender: userId, receiver: otherUserId },
          { sender: otherUserId, receiver: userId }
        ]
      })
      .sort({ createdAt: 1 })
      .populate('sender', 'name avatarUrl')
      .populate('receiver', 'name avatarUrl');

      // Mark messages from other user as read
      await Message.updateMany(
        { sender: otherUserId, receiver: userId, read: false },
        { read: true }
      );

      res.json({
        success: true,
        data: {
          messages,
          participant: {
            _id: otherUser._id,
            name: otherUser.name,
            avatarUrl: otherUser.avatarUrl,
            status: otherUser.status
          }
        }
      });
    } catch (error) {
      next(error);
    }
  }
};