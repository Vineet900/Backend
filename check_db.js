import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ytvtrcgnmdwxszbuujtx.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl0dnRyY2dubWR3eHN6YnV1anR4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzcxMjUwMiwiZXhwIjoyMDkzMjg4NTAyfQ.8PGVNN0JhV9ZBnWDMM5v94J0W6O4HSt4Y0HSaDSQA48';

const adminSupabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function checkDb() {
  try {
    // There is no direct "show tables" via supabase js client.
    // We can try to query 'courses' and 'lessons' to see if they exist.
    const { data: courses, error: err1 } = await adminSupabase.from('courses').select('*').limit(1);
    console.log('Courses:', err1 ? err1.message : 'Exists, row count=' + courses.length);

    const { data: lessons, error: err2 } = await adminSupabase.from('lessons').select('*').limit(1);
    console.log('Lessons:', err2 ? err2.message : 'Exists, row count=' + lessons.length);

    const { data: profiles, error: err3 } = await adminSupabase.from('profiles').select('*').limit(1);
    console.log('Profiles:', err3 ? err3.message : 'Exists, row count=' + profiles.length);
  } catch (e) {
    console.error(e);
  }
}

checkDb();
