import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { authenticate } from '../middleware/auth.middleware';
import { AppError } from '../middleware/error-handler';
import { config } from '../config';

const router = Router();

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, config.uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

// File filter
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Accept images, documents, and PDFs
  const allowedMimeTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: config.maxFileSize // 5MB
  }
});

// Apply authentication to all routes
router.use(authenticate);

// Upload avatar
router.post('/avatar', upload.single('avatar'), (req, res) => {
  if (!req.file) {
    throw new AppError(400, 'No file uploaded');
  }

  res.json({
    success: true,
    data: {
      filename: req.file.filename,
      path: `/uploads/${req.file.filename}`
    }
  });
});

// Upload multiple files
router.post('/files', upload.array('files', 10), (req, res) => {
  if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
    throw new AppError(400, 'No files uploaded');
  }

  const files = (req.files as Express.Multer.File[]).map(file => ({
    filename: file.filename,
    path: `/uploads/${file.filename}`,
    mimetype: file.mimetype,
    size: file.size
  }));

  res.json({
    success: true,
    data: files
  });
});

export default router;