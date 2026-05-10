import { supabase } from '../database/supabase.js';
import { z } from 'zod';

const profileUpdateSchema = z.object({
  full_name: z.string().min(2).optional(),
  bio: z.string().max(240).optional(),
  avatar_url: z.string().url().optional(),
  username: z.string().min(3).optional(),
});

/**
 * @desc    Update user profile
 * @route   PUT /api/v1/users/profile
 */
export const updateProfile = async (req, res, next) => {
  try {
    const validatedData = profileUpdateSchema.parse(req.body);

    const { data, error } = await supabase
      .from('profiles')
      .update(validatedData)
      .eq('user_id', req.user.id)
      .select()
      .single();

    if (error) throw error;

    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Sync real-time learning stats (DEPRECATED - Use Atomic Rewards)
 * @route   POST /api/v1/users/sync-stats
 */
export const syncStats = async (req, res, next) => {
    // This endpoint is disabled for security. Rewards are issued server-side during progress updates.
    res.status(200).json({ success: true, message: 'Sync disabled (Security Policy)' });
};

/**
 * @desc    Convert XP to Study Points (Atomic)
 * @route   POST /api/v1/users/convert-xp
 */
export const convertXPToSP = async (req, res, next) => {
  try {
    const { amount } = req.body; // XP amount (multiple of 100)
    
    if (!amount || amount < 100 || amount % 100 !== 0) {
        return res.status(400).json({ success: false, message: 'Amount must be a multiple of 100 XP' });
    }

    const spReward = amount / 100;

    // Call Atomic RPC Function to prevent race conditions
    const { error } = await supabase.rpc('award_user_reward', {
      p_user_id: req.user.id,
      p_xp_amount: -amount, // Deduct XP
      p_sp_amount: spReward, // Add SP
      p_description: `XP Conversion: ${amount} XP to ${spReward} SP`
    });

    if (error) throw error;

    res.status(200).json({ success: true, message: `Successfully converted ${amount} XP to ${spReward} SP` });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get current user profile
 * @route   GET /api/user/profile
 */
export const getProfile = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', req.user.id)
      .single();

    if (error) throw error;
    res.status(200).json({ success: true, profile: data });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get user wallet balance
 * @route   GET /api/user/wallet
 */
export const getWallet = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('wallets')
      .select('*')
      .eq('user_id', req.user.id)
      .single();

    if (error) throw error;
    res.status(200).json({ success: true, wallet: data });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get user notifications
 * @route   GET /api/user/notifications
 */
export const getNotifications = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) throw error;
    res.status(200).json({ success: true, notifications: data });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get Global Leaderboard
 */
export const getLeaderboard = async (req, res, next) => {
  // ... existing code ...
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('username, full_name, avatar_url, xp, level')
      .order('xp', { ascending: false })
      .limit(50);

    if (error) throw error;

    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};
