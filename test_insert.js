import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ytvtrcgnmdwxszbuujtx.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl0dnRyY2dubWR3eHN6YnV1anR4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzcxMjUwMiwiZXhwIjoyMDkzMjg4NTAyfQ.8PGVNN0JhV9ZBnWDMM5v94J0W6O4HSt4Y0HSaDSQA48';

const adminSupabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function test() {
  const reqBody = {
    title: 'Test Course 2', language: 'EN', author: 'Test Author', status: 'Draft', lessons: 0
  };
  const { data, error } = await adminSupabase.from('courses').insert([reqBody]).select().single();
  console.log("Data:", data);
  console.log("Error:", error);
}

test();
