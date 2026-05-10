import { createClient } from '@supabase/supabase-js';
import { config } from '../config/index.js';

/**
 * 🛡️ ENTERPRISE ARCHITECTURE: Isolated Clients
 * We use two separate clients to prevent "Session Pollution".
 * 
 * 1. supabaseAdmin: Used for DB operations. persistSession is FALSE.
 * 2. supabaseAuth: Used for token verification. isolated from DB client.
 */

export const supabase = createClient(config.supabase.url, config.supabase.serviceRole, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false
  }
});

export const supabaseAuth = createClient(config.supabase.url, config.supabase.serviceRole, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false
  }
});
