import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const contentRoot = path.resolve(__dirname, '../../../frontend devschool/src/content')
const coursesRoot = path.resolve(__dirname, '../../../frontend devschool/src/content/courses')
const quizzesRoot = path.resolve(__dirname, '../../../frontend devschool/src/content/quizzes')

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey || supabaseKey.includes('your_service_role_key')) {
  console.error('❌ ERROR: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is missing in .env')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

// ─── Upsert a single lesson ───────────────────────────────────────────────────
async function upsertLesson(lesson, courseId) {
  const theory = lesson.theory || {}
  // Support both old format (english/hindi/hinglish) and new format (introduction/concepts/notes)
  const normalizedTheory = theory.english !== undefined ? theory : {
    english: [
      theory.introduction || '',
      ...(theory.concepts || []),
      ...(theory.notes || [])
    ].filter(Boolean).join('\n\n'),
    hindi: theory.introduction || '',
    hinglish: theory.introduction || '',
  }

  const { error } = await supabase.from('lessons').upsert({
    slug: lesson.slug,
    course_id: courseId,
    title: lesson.title,
    chapter_number: lesson.chapter_number || lesson.chapterNumber,
    level: lesson.level || 'beginner',
    estimated_time: lesson.estimated_time || lesson.estimatedTime || '10 min',
    theory: normalizedTheory,
    examples: lesson.examples || [],
    exercises: lesson.exercises || [],
    quiz: lesson.quiz || [],
    summary: lesson.summary || '',
  }, { onConflict: 'slug' })

  return error
}

// ─── Upsert a course ─────────────────────────────────────────────────────────
async function upsertCourse(courseId, courseTitle, extra = {}) {
  const { error } = await supabase.from('courses').upsert({
    slug: courseId,
    title: courseTitle,
    description: extra.description || '',
    difficulty: extra.difficulty || extra.level || 'Beginner',
    category: extra.category || 'General',
    language: extra.language || 'EN',
    status: extra.status || 'Published',
    author: extra.author || 'DevSchool AI',
  }, { onConflict: 'slug' })
  return error
}

// ─── Sync NEW FORMAT: single course JSON file ─────────────────────────────────
async function syncNewFormatFile(filePath) {
  const raw = JSON.parse(fs.readFileSync(filePath, 'utf8'))
  const courseData = raw.course
  const lessons = raw.lessons || []

  if (!courseData || !courseData.title) {
    console.error(`  ❌ Invalid course file: ${filePath}`)
    return
  }

  const courseId = courseData.slug || courseData.title.toLowerCase().replace(/\s+/g, '-')
  console.log(`\n📂 [NEW FORMAT] Syncing course: ${courseData.title} (${lessons.length} lessons)`)

  const courseErr = await upsertCourse(courseId, courseData.title, courseData)
  if (courseErr) { console.error(`  ❌ Course error:`, courseErr.message); return }
  console.log(`  ✅ Course upserted: ${courseData.title}`)

  for (const lesson of lessons) {
    const err = await upsertLesson(lesson, courseId)
    if (err) console.error(`  ❌ Lesson error [${lesson.slug}]:`, err.message)
    else console.log(`  ✅ Lesson synced: ${lesson.title}`)
  }
}

// ─── Sync OLD FORMAT: one JSON file per lesson ────────────────────────────────
async function syncOldFormatFolder(moduleName) {
  const folderPath = path.join(contentRoot, moduleName)
  if (!fs.existsSync(folderPath) || !fs.statSync(folderPath).isDirectory()) return

  console.log(`\n📂 [OLD FORMAT] Syncing module: ${moduleName.toUpperCase()}`)

  const courseErr = await upsertCourse(moduleName, moduleName.toUpperCase())
  if (courseErr) { console.error(`  ❌ Course error:`, courseErr.message); return }

  const files = fs.readdirSync(folderPath).filter(f => f.endsWith('.json')).sort()
  for (const fileName of files) {
    const lesson = JSON.parse(fs.readFileSync(path.join(folderPath, fileName), 'utf8'))
    const err = await upsertLesson(lesson, moduleName)
    if (err) console.error(`  ❌ Lesson error [${lesson.slug}]:`, err.message)
    else console.log(`  ✅ Lesson synced: ${lesson.title}`)
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function syncContent() {
  console.log('🚀 Starting DevSchool Pro content sync...\n')

  // 0. Sync standalone quiz files from /content/quizzes/
  if (fs.existsSync(quizzesRoot)) {
    const quizFiles = fs.readdirSync(quizzesRoot).filter(f => f.endsWith('.json'))
    console.log(`📦 Quiz files: ${quizFiles.length}`)
    for (const file of quizFiles) {
      const raw = JSON.parse(fs.readFileSync(path.join(quizzesRoot, file), 'utf8'))
      const { error } = await supabase.from('quizzes').upsert({
        title: raw.title,
        topic: raw.topic,
        difficulty: raw.difficulty || 'Medium',
        status: raw.status || 'Active',
        questions: raw.questions?.length || 0,
        data: raw.questions,
      }, { onConflict: 'title' })
      if (error) console.error(`  ❌ Quiz error [${raw.title}]:`, error.message)
      else console.log(`  ✅ Quiz synced: ${raw.title} (${raw.questions?.length} questions)`)
    }
  }

  // 1. Sync NEW FORMAT course files from /content/courses/
  if (fs.existsSync(coursesRoot)) {
    const courseFiles = fs.readdirSync(coursesRoot).filter(f => f.endsWith('.json'))
    console.log(`📦 New-format course files: ${courseFiles.length}`)
    for (const file of courseFiles) {
      await syncNewFormatFile(path.join(coursesRoot, file))
    }
  }

  // 2. Sync OLD FORMAT per-lesson folders from /content/
  const skipDirs = new Set(['courses', 'quizzes']) // skip new-format and quizzes folders
  const modules = fs.readdirSync(contentRoot).filter(name => {
    if (skipDirs.has(name)) return false
    return fs.statSync(path.join(contentRoot, name)).isDirectory()
  })
  console.log(`\n📦 Old-format modules: ${modules.join(', ')}`)
  for (const mod of modules) {
    await syncOldFormatFolder(mod)
  }

  console.log('\n✅ All content synced successfully!')
}

syncContent()
