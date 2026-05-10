import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ytvtrcgnmdwxszbuujtx.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl0dnRyY2dubWR3eHN6YnV1anR4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzcxMjUwMiwiZXhwIjoyMDkzMjg4NTAyfQ.8PGVNN0JhV9ZBnWDMM5v94J0W6O4HSt4Y0HSaDSQA48';

const adminSupabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function checkDb() {
  try {
    const { data: courses } = await adminSupabase.from('courses').select('*').limit(1);
    console.log('Courses sample:', JSON.stringify(courses[0], null, 2));

    const { data: profiles } = await adminSupabase.from('profiles').select('*').limit(1);
    console.log('Profiles sample:', JSON.stringify(profiles[0], null, 2));
  } catch (e) {
    console.error(e);
  }
}

checkDb();
