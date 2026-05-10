import { supabase } from '../database/supabase.js';
import { z } from 'zod';
import os from 'os';

/**
 * @desc    Get system health and stats
 * @route   GET /api/admin/system-health
 */
export const getSystemHealth = async (req, res, next) => {
  try {
    const health = {
      status: 'UP',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      cpu: os.loadavg(),
      timestamp: new Date().toISOString()
    };
    res.status(200).json({ success: true, data: health });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Adjust user points (Atomic)
 * @route   POST /api/admin/points/adjust
 */
export const adjustUserPoints = async (req, res, next) => {
  try {
    const schema = z.object({
      userId: z.string().uuid(),
      amount: z.number(),
      reason: z.string().min(5)
    });
    const { userId, amount, reason } = schema.parse(req.body);

    const { error } = await supabase.rpc('award_user_reward', {
      p_user_id: userId,
      p_xp_amount: 0,
      p_sp_amount: amount,
      p_description: `Admin Adjustment: ${reason}`
    });

    if (error) throw error;

    res.status(200).json({ success: true, message: 'Points adjusted successfully' });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Ban or Unban user
 * @route   POST /api/admin/users/:id/ban
 */
export const toggleUserBan = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { banned } = req.body;

    const { error } = await supabase
      .from('profiles')
      .update({ is_verified: !banned }) // Using is_verified as a proxy or we could add a dedicated 'banned' column
      .eq('user_id', id);

    if (error) throw error;

    await supabase.from('admin_logs').insert({
        admin_id: req.user.id,
        action: banned ? 'BAN_USER' : 'UNBAN_USER',
        target_id: id
    });

    res.status(200).json({ success: true, message: `User ${banned ? 'banned' : 'unbanned'} successfully` });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get audit logs
 * @route   GET /api/admin/audit-logs
 */
export const getAuditLogs = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await supabase
      .from('admin_logs')
      .select('*, admin:admin_id(profiles(username))', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) throw error;

    res.status(200).json({ success: true, count, data });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get system settings
 * @route   GET /api/admin/settings
 */
export const getSettings = async (req, res, next) => {
  try {
    // Assuming a 'settings' table exists or returning default config
    res.status(200).json({
      success: true,
      data: {
        maintenanceMode: false,
        registrationEnabled: true,
        aiTutorModel: 'gpt-4o-mini'
      }
    });
  } catch (err) {
    next(err);
  }
};



/**
 * @desc    Get platform analytics (Aggregate stats)
 * @route   GET /api/admin/stats
 */
export const getAnalytics = async (req, res, next) => {
  try {
    const { data: userCount } = await supabase.from('profiles').select('id', { count: 'exact', head: true });
    const { data: lessonCount } = await supabase.from('lessons').select('id', { count: 'exact', head: true });
    const { data: progressCount } = await supabase.from('user_progress').select('id', { count: 'exact', head: true });
    
    // Recent activity trends
    const { data: recentActivity } = await supabase
      .from('user_progress')
      .select('created_at')
      .order('created_at', { ascending: false })
      .limit(100);

    res.status(200).json({
      success: true,
      data: {
        totalUsers: userCount?.length || 0,
        totalLessons: lessonCount?.length || 0,
        totalCompletions: progressCount?.length || 0,
        activeTrends: recentActivity || []
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Update user account details (Admin)
 * @route   PUT /api/admin/users/:id
 */
export const manageUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('user_id', id)
      .select()
      .single();

    if (error) throw error;

    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

