import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const adminSupabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkProfileSchema() {
  try {
    const { data, error } = await adminSupabase.from('profiles').select('*').limit(1);
    if (error) throw error;
    console.log('Profile columns:', Object.keys(data[0] || {}));
  } catch (e) {
    console.error(e);
  }
}

checkProfileSchema();
