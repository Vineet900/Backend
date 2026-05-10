import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const adminSupabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkRelations() {
  try {
    const { data: wallets, error: err1 } = await adminSupabase.from('wallets').select('*').limit(1);
    console.log('Wallets:', err1 ? err1.message : 'Exists');

    const { data: streaks, error: err2 } = await adminSupabase.from('streaks').select('*').limit(1);
    console.log('Streaks:', err2 ? err2.message : 'Exists');

    const { data: joined, error: err3 } = await adminSupabase
      .from('profiles')
      .select('*, wallets(*), streaks(*)')
      .limit(1);
    console.log('Join Query:', err3 ? err3.message : 'Success');
  } catch (e) {
    console.error(e);
  }
}

checkRelations();
