import { createClient } from '@supabase/supabase-js';
import { config } from '../config/index.js';

if (!config.supabase.url || !config.supabase.serviceRole) {
  throw new Error('Supabase URL or Service Role Key missing in config');
}

// Administrative client (Service Role) - Always bypasses RLS
export const supabase = createClient(config.supabase.url, config.supabase.serviceRole, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Auth-only client (Anon Key) - Used for verifying user tokens without polluting the Admin client
export const supabaseAuth = createClient(config.supabase.url, config.supabase.serviceRole, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});
