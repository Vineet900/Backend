import { createClient } from '@supabase/supabase-js';
import { config } from '../config/index.js';

if (!config.supabase.url || !config.supabase.serviceRole) {
  throw new Error('Supabase URL or Service Role Key missing in config');
}

// Using Service Role Key for backend administrative tasks
// Note: RLS is still respected for anon/authenticated keys, 
// but service_role bypasses it which is necessary for backend logic.
export const supabase = createClient(config.supabase.url, config.supabase.serviceRole, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});
