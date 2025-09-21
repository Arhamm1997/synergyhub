import { z } from 'zod';

const attachmentSchema = z.object({
  url: z.string().url(),
  name: z.string(),
  type: z.string(),
  size: z.number().optional()
});

const messageSchema = z.object({
  content: z.string().min(1, 'Message content is required'),
  receiver: z.string().min(1, 'Receiver ID is required'),
  attachments: z.array(attachmentSchema).optional(),
  metadata: z.object({
    isRead: z.boolean().optional(),
    readAt: z.string().datetime().optional(),
    forwarded: z.boolean().optional(),
    replyTo: z.string().optional()
  }).optional()
});

export const messageValidation = {
  sendMessage: {
    body: messageSchema
  },

  getMessages: {
    query: z.object({
      userId: z.string().optional(),
      businessId: z.string().optional(),
      search: z.string().optional(),
      before: z.string().datetime().optional(),
      after: z.string().datetime().optional(),
      limit: z.string().regex(/^\d+$/).transform(Number).optional(),
      page: z.string().regex(/^\d+$/).transform(Number).optional()
    }).optional()
  },

  getConversation: {
    params: z.object({
      id: z.string().min(1, 'Conversation ID is required')
    }),
    query: z.object({
      before: z.string().datetime().optional(),
      limit: z.string().regex(/^\d+$/).transform(Number).optional()
    }).optional()
  },

  updateMessage: {
    params: z.object({
      messageId: z.string().min(1, 'Message ID is required')
    }),
    body: z.object({
      content: z.string().min(1, 'Message content is required'),
      attachments: z.array(attachmentSchema).optional()
    })
  },

  deleteMessage: {
    params: z.object({
      messageId: z.string().min(1, 'Message ID is required')
    })
  },

  markAsRead: {
    params: z.object({
      messageId: z.string().min(1, 'Message ID is required')
    })
  },

  getUnreadCount: {
    query: z.object({
      userId: z.string().optional(),
      businessId: z.string().optional()
    }).optional()
  }
};