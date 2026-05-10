import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
  const { data: lessons } = await supabase
    .from('lessons')
    .select('title, slug')
    .eq('course_id', 'css')
    .order('chapter_number', { ascending: true })
    .limit(5);

  console.log('📖 CSS Lessons:');
  lessons?.forEach(l => console.log(` - ${l.title}: slug='${l.slug}'`));
}

check();
