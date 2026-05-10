import express from 'express';
import { 
  getCourses, 
  getCourse, 
  createCourse, 
  updateCourse, 
  deleteCourse,
  getDailyPlan
} from '../controllers/courseController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getCourses);
router.get('/daily-plan', getDailyPlan);
router.get('/:id', getCourse);

router.post('/', protect, authorize('ADMIN', 'INSTRUCTOR'), createCourse);
router.put('/:id', protect, authorize('ADMIN', 'INSTRUCTOR'), updateCourse);
router.delete('/:id', protect, authorize('ADMIN'), deleteCourse);

export default router;
