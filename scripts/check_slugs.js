import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
  console.log('🔍 Checking Course and Lesson Slugs...\n');

  const { data: courses } = await supabase.from('courses').select('id, title, slug');
  console.log('📚 Courses:');
  courses?.forEach(c => console.log(` - ${c.title}: slug='${c.slug}'` || 'NULL'));

  const { data: lessons } = await supabase.from('lessons').select('id, title, slug, course_id').limit(5);
  console.log('\n📖 Sample Lessons:');
  lessons?.forEach(l => console.log(` - ${l.title}: slug='${l.slug}', course_id='${l.course_id}'`));
}

check();
