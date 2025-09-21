import { Router } from 'express';
import { messageController } from '../controllers/message.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { messageValidation } from '../validations/message.validation';

const router = Router();

// Apply authentication to all routes
router.use(authenticate);

// Routes
router.get('/', validate(messageValidation.getMessages), messageController.getMessages);
router.post('/', validate(messageValidation.sendMessage), messageController.sendMessage);
router.get('/conversations/:id', validate(messageValidation.getConversation), messageController.getConversation);
router.put('/:messageId', validate(messageValidation.updateMessage), messageController.updateMessage);
router.delete('/:messageId', validate(messageValidation.deleteMessage), messageController.deleteMessage);
router.post('/:messageId/read', validate(messageValidation.markAsRead), messageController.markAsRead);
router.get('/unread', validate(messageValidation.getUnreadCount), messageController.getUnreadCount);

export default router;