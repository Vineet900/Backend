import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env from backend/.env
dotenv.config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY missing in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const FRONTEND_CONTENT_PATH = path.join(__dirname, '../../frontend/src/content');

async function syncData() {
  try {
    console.log('🚀 Starting Data Sync to Supabase...');

    // 1. Read roadmaps.json
    const roadmaps = JSON.parse(fs.readFileSync(path.join(FRONTEND_CONTENT_PATH, 'roadmaps.json'), 'utf8'));

    for (const roadmap of roadmaps) {
      console.log(`\n📚 Processing Course: ${roadmap.title}...`);

      // Upsert Course
      const { data: course, error: courseError } = await supabase
        .from('courses')
        .upsert({
          slug: roadmap.id,
          title: roadmap.title,
          description: roadmap.description,
          difficulty: roadmap.level,
          category: roadmap.category
        }, { onConflict: 'slug' })
        .select()
        .single();

      if (courseError) {
        console.error(`❌ Error upserting course ${roadmap.title}:`, courseError.message);
        continue;
      }

      console.log(`✅ Course synced: ${course.title} (${course.id})`);

      // 2. Process Sections (Steps)
      for (let i = 0; i < roadmap.steps.length; i++) {
        const step = roadmap.steps[i];
        console.log(`  🔹 Processing Section: ${step.title}...`);

        // Get or Create Section
        let activeSection;
        const { data: existingSection } = await supabase
          .from('sections')
          .select()
          .eq('course_id', course.id)
          .eq('title', step.title)
          .single();

        if (existingSection) {
          activeSection = existingSection;
        } else {
          const { data: newSection, error: sectionError } = await supabase
            .from('sections')
            .insert({
              course_id: course.id,
              title: step.title,
              sort_order: i + 1
            })
            .select()
            .single();
          
          if (sectionError) {
            console.error(`❌ Error creating section ${step.title}:`, sectionError.message);
            continue;
          }
          activeSection = newSection;
        }

        // 3. Process Lessons for this section
        const lessonsPath = path.join(FRONTEND_CONTENT_PATH, step.id);
        if (fs.existsSync(lessonsPath)) {
          const lessonFiles = fs.readdirSync(lessonsPath).filter(f => f.endsWith('.json'));
          
          for (const lessonFile of lessonFiles) {
            const lessonData = JSON.parse(fs.readFileSync(path.join(lessonsPath, lessonFile), 'utf8'));
            
            // Upsert Lesson
            const { data: lesson, error: lessonError } = await supabase
              .from('lessons')
              .upsert({
                section_id: activeSection.id,
                course_id: course.slug,
                slug: lessonData.slug,
                title: lessonData.title,
                chapter_number: lessonData.chapterNumber,
                level: lessonData.level || 'beginner',
                theory: JSON.stringify(lessonData.theory), // Store full theory object
                sort_order: lessonData.chapterNumber || 0
              }, { onConflict: 'slug' })
              .select()
              .single();

            if (lessonError) {
              console.error(`    ❌ Error syncing lesson ${lessonData.title}:`, lessonError.message);
              continue;
            }

            console.log(`    ✅ Lesson synced: ${lesson.title}`);

            // 4. Process Quiz if exists
            if (lessonData.quiz && lessonData.quiz.length > 0) {
                const quizQuestions = lessonData.quiz.map(q => ({
                    question: q.question,
                    options: q.options,
                    correct_answer: q.options[q.answer], // Store the text value
                    explanation: q.explanation
                }));

                // Check for existing quiz
                const { data: existingQuiz } = await supabase
                    .from('quizzes')
                    .select('id')
                    .eq('section_id', activeSection.id)
                    .eq('title', `${lessonData.title} Quiz`)
                    .single();

                const quizPayload = {
                    section_id: activeSection.id,
                    title: `${lessonData.title} Quiz`,
                    questions: quizQuestions.length, // Store the count as number
                    data: quizQuestions, // Store the JSON in 'data'
                    passing_score: 70,
                    xp_reward: 100,
                    status: 'Active'
                };

                if (existingQuiz) {
                    const { error: quizError } = await supabase
                        .from('quizzes')
                        .update(quizPayload)
                        .eq('id', existingQuiz.id);
                    
                    if (quizError) console.error(`      ❌ Error updating quiz:`, quizError.message);
                    else console.log(`      🎯 Quiz updated`);
                } else {
                    const { error: quizError } = await supabase
                        .from('quizzes')
                        .insert(quizPayload);

                    if (quizError) console.error(`      ❌ Error creating quiz:`, quizError.message);
                    else console.log(`      🎯 Quiz created`);
                }
            }
          }
        }
      }
    }

    console.log('\n✨ Data Sync Completed Successfully!');
  } catch (err) {
    console.error('\n💥 Critical Sync Error:', err);
  }
}

syncData();
