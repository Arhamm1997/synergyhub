import { Router } from 'express';
import { body } from 'express-validator';
import { messageController } from '../controllers/message.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';

const router = Router();

// Validation rules
const messageValidation = [
  body('receiver')
    .isMongoId()
    .withMessage('Valid receiver ID is required'),
  body('content')
    .trim()
    .notEmpty()
    .withMessage('Message content is required'),
  body('attachments')
    .optional()
    .isArray()
    .withMessage('Attachments must be an array')
];

// Apply authentication to all routes
router.use(authenticate);

// Routes
router.get('/', messageController.getMessages);
router.post('/', validate(messageValidation), messageController.sendMessage);
router.get('/conversations/:id', messageController.getConversation);

export default router;