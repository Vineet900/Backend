import express from 'express';
import { 
  getAnalytics, 
  manageUser, 
  getSystemHealth, 
  adjustUserPoints, 
  toggleUserBan, 
  getAuditLogs, 
  getSettings,
  getUsers
} from '../controllers/adminController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);
router.use(authorize('ADMIN'));

router.get('/stats', getAnalytics);
router.get('/users', getUsers);
router.get('/system-health', getSystemHealth);
router.get('/audit-logs', getAuditLogs);
router.get('/settings', getSettings);

router.put('/users/:id', manageUser);
router.post('/users/:id/ban', toggleUserBan);
router.post('/points/adjust', adjustUserPoints);

export default router;
