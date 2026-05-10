import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
  console.log('🔍 Checking Supabase Database Status...\n');

  const tables = ['profiles', 'wallets', 'courses', 'sections', 'lessons', 'quizzes'];
  
  for (const table of tables) {
    const { count, error } = await supabase
      .from(table)
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      console.log(`❌ Table '${table}': ERROR - ${error.message}`);
    } else {
      console.log(`✅ Table '${table}': ${count} rows`);
    }
  }

  console.log('\n🔗 Testing Join Relationship (profiles -> wallets)...');
  const { data, error: joinError } = await supabase
    .from('profiles')
    .select('*, wallets(*)')
    .limit(1);

  if (joinError) {
    console.log(`❌ Relationship Test: FAILED - ${joinError.message}`);
  } else {
    console.log(`✅ Relationship Test: SUCCESS`);
  }
}

check();
