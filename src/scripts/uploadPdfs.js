import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const contentRoot = path.resolve(__dirname, '../../../frontend/src/content');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey || supabaseKey.includes('your_service_role_key')) {
  console.error('❌ ERROR: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is missing in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
const BUCKET_NAME = 'course-materials';

async function uploadPdfs() {
  console.log('🚀 Starting PDF upload to Supabase Storage...');

  // Ensure bucket exists
  const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
  
  if (bucketsError) {
    console.error('❌ Error fetching buckets:', bucketsError.message);
    return;
  }

  const bucketExists = buckets.some(b => b.name === BUCKET_NAME);
  
  if (!bucketExists) {
    console.log(`Creating public bucket '${BUCKET_NAME}'...`);
    const { error: createError } = await supabase.storage.createBucket(BUCKET_NAME, {
      public: true,
      allowedMimeTypes: ['application/pdf'],
    });
    
    if (createError) {
      console.error(`❌ Error creating bucket '${BUCKET_NAME}':`, createError.message);
      return;
    }
  } else {
    // Just to be sure it's public
    await supabase.storage.updateBucket(BUCKET_NAME, {
      public: true,
      allowedMimeTypes: ['application/pdf']
    });
  }

  // Find all PDFs
  function findPdfs(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach((file) => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      if (stat && stat.isDirectory()) {
        results = results.concat(findPdfs(filePath));
      } else if (file.endsWith('.pdf')) {
        results.push(filePath);
      }
    });
    return results;
  }

  const pdfFiles = findPdfs(contentRoot);
  
  if (pdfFiles.length === 0) {
    console.log('No PDFs found in the content directory.');
    return;
  }

  console.log(`Found ${pdfFiles.length} PDF(s). Uploading...`);

  for (const filePath of pdfFiles) {
    const fileName = path.basename(filePath);
    // You can also include the module folder name in the upload path if you want (e.g. html/HTML_Complete_Chapter_Notes.pdf)
    // Here we'll just use the file name
    const fileBuffer = fs.readFileSync(filePath);

    console.log(`   - Uploading: ${fileName}...`);
    
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(fileName, fileBuffer, {
        contentType: 'application/pdf',
        upsert: true
      });

    if (error) {
      console.error(`     ❌ Error uploading ${fileName}:`, error.message);
    } else {
      console.log(`     ✅ Uploaded successfully! Public path: ${data.path}`);
    }
  }

  console.log('\n✅ Upload completed!');
}

uploadPdfs();
