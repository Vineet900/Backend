import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing credentials in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  console.log('🔍 Testing connection to:', supabaseUrl);
  
  try {
    const { data: courses, count, error } = await supabase
      .from('courses')
      .select('*', { count: 'exact' });

    if (error) {
      console.error('❌ Connection Error:', error.message);
    } else {
      console.log('✅ Connection Successful!');
      console.log('📊 Courses Count:', count || courses?.length || 0);
      console.log('📂 First Course:', courses?.[0]?.title || 'None');
      
      const { data: users, count: userCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
      console.log('👥 Total Users:', userCount || 0);
    }
  } catch (err) {
    console.error('💥 Execution Error:', err.message);
  }
}

testConnection();
