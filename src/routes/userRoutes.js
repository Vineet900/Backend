import express from 'express';
import { updateProfile, syncStats, convertXPToSP, getLeaderboard } from '../controllers/userController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.put('/update', protect, updateProfile);
router.post('/sync-stats', protect, syncStats);
router.post('/convert-xp', protect, convertXPToSP);
router.get('/leaderboard', getLeaderboard);

export default router;
