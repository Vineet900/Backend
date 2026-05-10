import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../backend/.env') });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function inspect() {
  const { data, error } = await supabase.from('quizzes').select('*').limit(1);
  if (error) {
    console.error('Error:', error);
    return;
  }
  if (data && data.length > 0) {
    console.log('Sample Quiz Row:');
    console.log(JSON.stringify(data[0], null, 2));
    
    console.log('\nTypes:');
    for (const key in data[0]) {
      console.log(`${key}: ${typeof data[0][key]} (${data[0][key] === null ? 'null' : 'value exists'})`);
    }
  } else {
    console.log('No quiz rows found.');
  }
}

inspect();
