import express from 'express';
import { 
  getMe, 
  login, 
  register, 
  verify, 
  logout,
  syncProfile,
  forgotPassword 
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/verify', verify);
router.post('/forgot-password', forgotPassword);
router.get('/logout', logout);

router.get('/me', protect, getMe);
router.post('/sync', syncProfile);

export default router;
