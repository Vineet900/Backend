import express from 'express';
import { askTutor, getHistory } from '../controllers/tutorController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/chat', protect, askTutor);
router.get('/history', protect, getHistory);

export default router;
