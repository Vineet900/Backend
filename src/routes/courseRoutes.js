import express from 'express';
import { 
  getCourses, 
  getCourse, 
  getLessonBySlug, 
  searchCourses 
} from '../controllers/courseController.js';

const router = express.Router();

// Public routes
router.get('/', getCourses);
router.get('/search', searchCourses);
router.get('/lessons/:slug', getLessonBySlug); // This was causing the 404
router.get('/:id', getCourse);

export default router;
