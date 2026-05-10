import { supabase } from './src/database/supabase.js';

async function check() {
    try {
        const { data, error } = await supabase.from('courses').select('*').limit(1);
        if (data && data[0]) {
            console.log('Sample Course:', data[0]);
        } else {
            console.error('No data in courses or error:', error);
        }
    } catch (err) {
        console.error(err);
    }
}

check();
