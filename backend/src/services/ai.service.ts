import { config } from '../config';

interface NotificationInput {
  id: string;
  message: string;
  type: string;
  timestamp: string;
}

interface PrioritizedNotification {
  id: string;
  priorityScore: number;
}

export const prioritizeNotifications = async (
  input: { notifications: NotificationInput[] }
): Promise<PrioritizedNotification[]> => {
  try {
    // Check if Gemini AI API key is available
    if (!config.geminiApiKey) {
      console.log('Gemini AI API key not configured, using default prioritization');
      return getDefaultPriorities(input.notifications);
    }

    // For now, we'll use a simple rule-based system instead of Google AI
    // This can be replaced with actual AI service when dependencies are properly set up
    return getRuleBasedPriorities(input.notifications);
    
  } catch (error) {
    console.error('Error prioritizing notifications:', error);
    // Return default priorities on error
    return getDefaultPriorities(input.notifications);
  }
};

// Simple rule-based prioritization system
function getRuleBasedPriorities(notifications: NotificationInput[]): PrioritizedNotification[] {
  return notifications.map(notification => {
    let priority = 50; // Default medium priority
    
    // High priority types
    if (notification.type === 'TASK_ASSIGNED' || 
        notification.type === 'PROJECT_DEADLINE' ||
        notification.type === 'URGENT_MESSAGE') {
      priority = 80;
    }
    
    // Medium-high priority
    else if (notification.type === 'TASK_COMPLETED' || 
             notification.type === 'PROJECT_UPDATE') {
      priority = 65;
    }
    
    // Low priority
    else if (notification.type === 'GENERAL_UPDATE' ||
             notification.type === 'SYSTEM_NOTIFICATION') {
      priority = 30;
    }
    
    // Boost priority for recent notifications
    const notificationTime = new Date(notification.timestamp);
    const now = new Date();
    const hoursDiff = (now.getTime() - notificationTime.getTime()) / (1000 * 60 * 60);
    
    if (hoursDiff < 1) {
      priority += 10; // Recent notifications get priority boost
    }
    
    // Check message content for urgent keywords
    const urgentKeywords = ['urgent', 'asap', 'immediate', 'critical', 'emergency'];
    const messageWords = notification.message.toLowerCase().split(' ');
    
    if (urgentKeywords.some(keyword => messageWords.includes(keyword))) {
      priority += 15;
    }
    
    return {
      id: notification.id,
      priorityScore: Math.min(100, Math.max(0, priority))
    };
  });
}

// Default priorities when AI is not available
function getDefaultPriorities(notifications: NotificationInput[]): PrioritizedNotification[] {
  return notifications.map(notification => ({
    id: notification.id,
    priorityScore: 50 // Default medium priority
  }));
}