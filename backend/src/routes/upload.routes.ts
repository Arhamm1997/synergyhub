import { Router } from 'express';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { authenticate } from '../middleware/auth.middleware';
import { AppError } from '../utils/errors';
import { config } from '../config';
import { UploadService } from '../services/upload.service';
import { User } from '../models/user.model';
import path from 'path';

const router = Router();
const uploadService = new UploadService();

// Memory storage for temporary file handling
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: config.maxFileSize // 5MB
  }
});

// Apply authentication to all routes
router.use(authenticate);

// Get pre-signed URL for avatar upload
router.get('/avatar/signed-url', authenticate, async (req, res) => {
  const fileExtension = req.query.fileType?.toString().split('/')[1];
  if (!fileExtension) {
    throw new AppError('File type is required', 400);
  }

  const key = `avatars/${req.user.id}/${uuidv4()}.${fileExtension}`;
  const contentType = req.query.fileType?.toString();

  if (!uploadService.validateFileType(contentType)) {
    throw new AppError('Invalid file type', 400);
  }

  const signedUrl = await uploadService.getSignedUploadUrl(key, contentType);

  res.json({
    success: true,
    data: {
      signedUrl,
      key,
      publicUrl: uploadService.getPublicUrl(key)
    }
  });
});

// Update user's avatar URL
router.post('/avatar/confirm', authenticate, async (req, res) => {
  const { key } = req.body;

  if (!key) {
    throw new AppError('File key is required', 400);
  }

  // Update user's avatar URL
  const user = await User.findByIdAndUpdate(
    req.user.id,
    {
      avatarUrl: uploadService.getPublicUrl(key),
      avatarHint: 'User profile picture'
    },
    { new: true }
  );

  res.json({
    success: true,
    data: {
      avatarUrl: user.avatarUrl
    }
  });
});

// Upload file directly
router.post('/files', authenticate, upload.array('files', 10), async (req, res) => {
  if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
    throw new AppError('No files uploaded', 400);
  }

  const files = await Promise.all((req.files as Express.Multer.File[]).map(async file => {
    const key = `files/${req.user.id}/${uuidv4()}${path.extname(file.originalname)}`;

    if (!uploadService.validateFileType(file.mimetype)) {
      throw new AppError(`Invalid file type: ${file.mimetype}`, 400);
    }

    const url = await uploadService.uploadFile(key, file.buffer, file.mimetype);

    return {
      filename: file.originalname,
      key,
      url,
      mimetype: file.mimetype,
      size: file.size
    };
  }));

  res.json({
    success: true,
    data: files
  });
});

export { router };