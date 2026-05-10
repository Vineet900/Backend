import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
  console.log('🔍 Checking Column Existence...\n');

  const { data: lessons, error: lErr } = await supabase.from('lessons').select('*').limit(1);
  if (lErr) {
    console.log(`❌ Lessons Table Error: ${lErr.message}`);
  } else {
    console.log(`✅ Lessons Table columns: ${Object.keys(lessons[0] || {}).join(', ')}`);
  }

  const { data: quizzes, error: qErr } = await supabase.from('quizzes').select('*').limit(1);
  if (qErr) {
    console.log(`❌ Quizzes Table Error: ${qErr.message}`);
  } else {
    console.log(`✅ Quizzes Table columns: ${Object.keys(quizzes[0] || {}).join(', ')}`);
  }
}

check();
