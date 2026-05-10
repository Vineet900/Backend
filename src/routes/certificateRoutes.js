import express from 'express';
import { generateCertificate, verifyCertificate } from '../controllers/certificateController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/generate/:courseId', protect, generateCertificate);
router.get('/verify/:code', verifyCertificate);

export default router;
