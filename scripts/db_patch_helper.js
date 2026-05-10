import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function patch() {
    console.log('🛠️ Running Senior Database Auto-Patch...');
    try {
        // We use RPC or raw SQL via the API if possible, but since we can't run raw SQL easily via JS without an RPC function, 
        // we will try to detect if the column exists by doing a small query.
        // Since we can't ALTER via JS API, I will provide the SQL one last time with a clear instruction.
        
        console.log('⚠️  Note: Supabase JS SDK cannot perform ALTER TABLE commands directly.');
        console.log('👉 Please COPY and PASTE the following SQL into your Supabase SQL Editor:');
        console.log('\nALTER TABLE public.courses ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT true;');
        console.log('ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS status TEXT DEFAULT "Published";');
        console.log('ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS language TEXT DEFAULT "EN";');
        console.log('NOTIFY pgrst, "reload schema";\n');
        
    } catch (err) {
        console.error('❌ Patch failed:', err.message);
    }
}

patch();
