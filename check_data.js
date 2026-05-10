import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ytvtrcgnmdwxszbuujtx.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl0dnRyY2dubWR3eHN6YnV1anR4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzcxMjUwMiwiZXhwIjoyMDkzMjg4NTAyfQ.8PGVNN0JhV9ZBnWDMM5v94J0W6O4HSt4Y0HSaDSQA48';

const adminSupabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function checkData() {
  const { data: courses, error: coursesError } = await adminSupabase.from('courses').select('id, title');
  console.log('Courses in DB:', courses?.length, courses);

  const { data: lessons, error: lessonsError } = await adminSupabase.from('lessons').select('id, course_id, title');
  console.log('Lessons in DB:', lessons?.length);
  
  // Also test the API endpoints locally
  try {
    const res = await fetch('http://127.0.0.1:4000/api/admin/courses');
    const apiCourses = await res.json();
    console.log('API Courses endpoint success:', apiCourses.success, 'Count:', apiCourses.data?.length);
    
    const res2 = await fetch('http://127.0.0.1:4000/api/admin/courses/all/lessons');
    const apiLessons = await res2.json();
    console.log('API Lessons endpoint success:', apiLessons.success, 'Count:', apiLessons.data?.length);
  } catch(e) {
    console.error('API Error:', e.message);
  }
}

checkData();
