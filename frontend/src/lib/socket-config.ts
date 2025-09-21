import { io, Socket } from 'socket.io-client';
import { WS_URL } from './api-config';

let socket: Socket | null = null;

export const getSocket = () => {
  if (!socket) {
    socket = io(`${WS_URL}/public`, {
      transports: ['websocket', 'polling'],  // Try WebSocket first, fallback to polling
      withCredentials: true,
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 3000,
      timeout: 10000,
    });

    socket.on('connect', () => {
      console.log('Socket connected');
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
    });

    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  }
  return socket;
};

export const closeSocket = () => {
  if (socket) {
    socket.close();
    socket = null;
  }
};

export const socketEvents = {
  // Messages
  NEW_MESSAGE: 'new_message',
  MESSAGE_READ: 'message_read',
  
  // Notifications
  NEW_NOTIFICATION: 'new_notification',
  NOTIFICATION_READ: 'notification_read',
  
  // Tasks
  TASK_UPDATED: 'task_updated',
  TASK_CREATED: 'task_created',
  TASK_DELETED: 'task_deleted',
  
  // Projects
  PROJECT_UPDATED: 'project_updated',
  PROJECT_CREATED: 'project_created',
  PROJECT_DELETED: 'project_deleted',
  
  // Users
  USER_STATUS_CHANGED: 'user_status_changed',
};