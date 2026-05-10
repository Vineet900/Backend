import express from 'express';
import { askTutor } from '../controllers/tutorController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/', protect, askTutor);

export default router;
