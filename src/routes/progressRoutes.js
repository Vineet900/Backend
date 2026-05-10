import express from 'express';
import { updateLessonProgress, getCourseProgress } from '../controllers/progressController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.post('/lesson', updateLessonProgress);
router.get('/:courseId', getCourseProgress);

export default router;
