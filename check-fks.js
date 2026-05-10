import { supabase } from './src/database/supabase.js';

async function checkFKs() {
    try {
        console.log('Checking Foreign Keys...');
        // This is a standard query to check FKs in Postgres
        const { data, error } = await supabase.rpc('get_foreign_keys');
        
        if (error) {
            console.log('RPC failed, trying raw query via standard select if possible...');
            // We can't really do raw SQL easily without a specific RPC.
            // Let's try to see if we can at least confirm the course_id column type.
            const { data: cols } = await supabase.from('lessons').select('*').limit(1);
            console.log('Sample Lesson:', cols?.[0]);
        } else {
            console.log('Foreign Keys:', data);
        }
    } catch (err) {
        console.error(err);
    }
}

checkFKs();
