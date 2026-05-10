import { supabase } from '../database/supabase.js';
import { logger } from '../utils/logger.js';
import { z } from 'zod';

/**
 * @desc    Get current authenticated user profile
 */
export const getMe = async (req, res, next) => {
  try {
    if (!req.user || !req.user.id) {
        return res.status(401).json({ success: false, message: 'User context missing' });
    }

    let { data: profile, error } = await supabase
      .from('profiles')
      .select('*, wallets(*), streaks(*)')
      .or(`user_id.eq.${req.user.id},userId.eq.${req.user.id}`) // Support both camelCase and snake_case
      .maybeSingle();

    if (error) {
        logger.error('Database error in getMe:', error);
        return res.status(500).json({ success: false, message: 'Database query failed' });
    }

    if (!profile) {
        logger.info(`Creating new profile for user ${req.user.id}`);
        const username = req.user.email ? req.user.email.split('@')[0] : `agent_${Math.floor(Math.random() * 10000)}`;
        
        // Attempt insert with both potential column naming conventions
        const profileData = {
            username,
            full_name: req.user.email ? req.user.email.split('@')[0] : 'New Agent',
            name: req.user.email ? req.user.email.split('@')[0] : 'New Agent',
            xp: 0,
            level: 1,
            role: 'STUDENT'
        };

        // We try both snake_case and camelCase for the foreign key
        try {
            const { data: newProfile, error: createError } = await supabase
                .from('profiles')
                .insert({ ...profileData, user_id: req.user.id })
                .select()
                .single();
            
            if (createError) {
                // If it fails, try the camelCase version
                const { data: altProfile, error: altError } = await supabase
                    .from('profiles')
                    .insert({ ...profileData, userId: req.user.id })
                    .select()
                    .single();
                
                if (altError) throw altError;
                profile = altProfile;
            } else {
                profile = newProfile;
            }
        } catch (err) {
            logger.error('Critical: Failed to create profile even with alternate keys:', err);
            return res.status(500).json({ 
                success: false, 
                message: 'Profile creation blocked by database policies (RLS). Please check Supabase RLS settings.' 
            });
        }
        
        // Ensure wallet and streak exist
        try {
            await supabase.from('wallets').insert({ user_id: req.user.id, userId: req.user.id, balance: 0 });
            await supabase.from('streaks').insert({ user_id: req.user.id, userId: req.user.id, current_streak: 0 });
        } catch (subError) {
            logger.warn('Sub-table initialization partial failure:', subError.message);
        }
    }

    res.status(200).json({
      success: true,
      data: {
        ...req.user,
        profile
      }
    });
  } catch (err) {
    logger.error('Exception in getMe:', err);
    next(err);
  }
};

/**
 * @desc    Register new user via Supabase
 */
export const register = async (req, res, next) => {
  try {
    const schema = z.object({
      email: z.string().email(),
      password: z.string().min(8),
      username: z.string().min(3),
      name: z.string().optional(),
      phone: z.string().optional()
    });
    const { email, password, username, name, phone } = schema.parse(req.body);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username, full_name: name, phone }
      }
    });

    if (error) throw error;

    if (data.user) {
        await supabase.from('profiles').insert({
            user_id: data.user.id,
            username,
            full_name: name,
            xp: 0,
            level: 1
        });
        await supabase.from('wallets').insert({ user_id: data.user.id, balance: 0 });
        await supabase.from('streaks').insert({ user_id: data.user.id, current_streak: 0 });
    }

    if (data.session) {
      res.cookie('token', data.session.access_token, {
        httpOnly: true,
        secure: false, // Set to true in production with HTTPS
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
      });
    }

    res.status(201).json({ success: true, message: 'Registration initiated. Please verify OTP.', data });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Login user via Supabase
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    if (data.session) {
      res.cookie('token', data.session.access_token, {
        httpOnly: true,
        secure: false, // Set to true in production with HTTPS
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
      });
    }

    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Verify OTP
 */
export const verify = async (req, res, next) => {
  try {
    const { email, otp, type = 'signup' } = req.body;
    const { data, error } = await supabase.auth.verifyOtp({ email, token: otp, type });

    if (error) throw error;
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Logout user
 */
export const logout = async (req, res, next) => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    
    res.clearCookie('token');
    res.status(200).json({ success: true, message: 'Logged out successfully' });
  } catch (err) {
    next(err);
  }
};

export const syncProfile = async (req, res, next) => {
    // Legacy sync logic for webhooks
    res.status(200).json({ success: true });
};
