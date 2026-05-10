import express from 'express';
import { submitQuiz, getQuizResults } from '../controllers/quizController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.post('/:id/submit', submitQuiz);
router.get('/:id/results', getQuizResults);

export default router;
