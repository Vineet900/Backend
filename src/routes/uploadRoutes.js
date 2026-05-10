import express from 'express';
import multer from 'multer';
import { uploadAvatar, uploadThumbnail } from '../controllers/uploadController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Multer Configuration (Memory Storage)
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB Limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only images are allowed'), false);
    }
  }
});

router.post('/avatar', protect, upload.single('image'), uploadAvatar);
router.post('/thumbnail', protect, authorize('ADMIN'), upload.single('image'), uploadThumbnail);

export default router;
