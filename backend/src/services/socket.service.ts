import { Server, Socket } from 'socket.io';
import { JwtService } from './jwt.service';
import { User } from '../models/user.model';
import { UserStatus } from '../types/enums';
import { logger } from '../utils/logger';

interface SocketUser extends Socket {
  userId?: string;
}

export const setupSocketHandlers = (io: Server) => {
  // Authentication middleware
  io.use(async (socket: SocketUser, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        throw new Error('Authentication error');
      }

      const decoded = JwtService.verifyToken(token);
      socket.userId = decoded.userId;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', async (socket: SocketUser) => {
    try {
      const userId = socket.userId;
      if (!userId) return;

      // Join user's room
      socket.join(userId);

      // Update user status
      await User.findByIdAndUpdate(userId, { status: UserStatus.Online });

      // Handle private messages
      socket.on('private-message', async (data) => {
        try {
          const { recipientId, message } = data;
          io.to(recipientId).emit('private-message', {
            senderId: userId,
            message
          });
        } catch (error) {
          logger.error('Error handling private message:', error);
        }
      });

      // Handle typing status
      socket.on('typing', (data) => {
        const { recipientId, isTyping } = data;
        io.to(recipientId).emit('typing', {
          senderId: userId,
          isTyping
        });
      });

      // Handle disconnection
      socket.on('disconnect', async () => {
        try {
          await User.findByIdAndUpdate(userId, { status: UserStatus.Offline });
          socket.leave(userId);
        } catch (error) {
          logger.error('Error handling disconnect:', error);
        }
      });
    } catch (error) {
      logger.error('Error in socket connection:', error);
    }
  });

  // Broadcast notification to specific user
  const sendNotificationToUser = (userId: string, notification: any) => {
    io.to(userId.toString()).emit('notification', notification);
  };

  // Make sendNotificationToUser available globally
  (global as any).io = {
    to: (userId: string) => ({
      emit: (event: string, data: any) => {
        io.to(userId).emit(event, data);
      }
    })
  };

  return {
    sendNotificationToUser
  };
};