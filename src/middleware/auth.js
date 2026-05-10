import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import { supabase } from '../database/supabase.js';

/**
 * Middleware to protect routes and verify Supabase JWT
 */
export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies?.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Authorization token missing' });
  }

  try {
    // Validate token with Supabase directly (more robust than manual JWT verify)
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !authUser) {
      if (authError) console.error('Supabase Auth Error:', authError.message);
      return res.status(401).json({ success: false, message: 'Invalid or expired token' });
    }

    // Fetch profile from DB
    // Use 'user_id' to match the schema used in other parts of the app
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', authUser.id)
      .maybeSingle();
    
    if (profileError) {
      console.warn('Profile fetch error (ignoring for new user check):', profileError.message);
    }

    if (profileError || !profile) {
      // Allow new users to proceed so profile can be created in getMe
      req.user = {
          id: authUser.id,
          email: authUser.email,
          role: authUser.user_metadata?.role || 'STUDENT',
          isNewUser: true
      };
      return next();
    }

    // Attach user data to request
    req.user = {
        id: profile.user_id,
        email: authUser.email, // Also attach email for convenience
        role: profile.role || authUser.user_metadata?.role || 'STUDENT',
        username: profile.username,
        profile
    };

    next();
  } catch (err) {
    console.error('Auth Middleware Exception:', err);
    return res.status(500).json({ success: false, message: 'Authentication process failed' });
  }
};

/**
 * Middleware to restrict access to specific roles
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role ${req.user.role} is not authorized to perform this action`
      });
    }
    next();
  };
};
