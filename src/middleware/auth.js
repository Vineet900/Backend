import { config } from '../config/index.js';
import { supabase, supabaseAuth } from '../database/supabase.js';

/**
 * @desc    Verify Supabase JWT without polluting the global Admin client
 */
export const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies?.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({ success: false, message: 'Authentication token missing' });
    }

    // CRITICAL: Use the isolated supabaseAuth client to verify token
    // This prevents the user's session from overriding the Admin client's service role
    const { data: { user: authUser }, error: authError } = await supabaseAuth.auth.getUser(token);
    
    if (authError || !authUser) {
      return res.status(401).json({ success: false, message: 'Invalid or expired token' });
    }

    // Use the primary supabase (Admin) client to fetch profile (RLS bypass)
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', authUser.id)
      .maybeSingle();

    if (!profile) {
      req.user = { id: authUser.id, email: authUser.email, role: 'STUDENT', isNewUser: true };
    } else {
      req.user = {
        id: profile.user_id,
        email: authUser.email,
        role: profile.role || 'STUDENT',
        username: profile.username,
        profile
      };
    }

    next();
  } catch (err) {
    console.error('Auth Middleware Critical Error:', err);
    return res.status(500).json({ success: false, message: 'Internal Server Error during Authentication' });
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role ${req.user.role} is not authorized`
      });
    }
    next();
  };
};
