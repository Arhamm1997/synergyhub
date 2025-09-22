import { create } from 'zustand';
import { useNotificationStore } from './notification-store';

export interface TaskComment {
  id: string;
  taskId: string;
  authorId: string;
  content: string;
  timestamp: Date;
  attachments?: string[];
}

interface CommentStore {
  comments: { [taskId: string]: TaskComment[] };
  addComment: (taskId: string, authorId: string, content: string, attachments?: string[]) => void;
  getComments: (taskId: string) => TaskComment[];
}

export const useCommentStore = create<CommentStore>((set, get) => ({
  comments: {},

  addComment: (taskId, authorId, content, attachments = []) => {
    const comment: TaskComment = {
      id: `COMMENT-${Date.now()}`,
      taskId,
      authorId,
      content,
      timestamp: new Date(),
      attachments
    };

    set((state) => ({
      comments: {
        ...state.comments,
        [taskId]: [...(state.comments[taskId] || []), comment]
      }
    }));

    // Send notification to task assignee
    useNotificationStore.getState().addNotification({
      type: 'task_commented',
      title: 'New Comment',
      message: `New comment on task you're assigned to`,
      data: { taskId, commentId: comment.id }
    });
  },

  getComments: (taskId) => {
    return get().comments[taskId] || [];
  }
}));