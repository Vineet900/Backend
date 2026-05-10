import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const contentRoot = path.resolve(__dirname, '../../../frontend/src/content')

const dailyPlanCatalog = {
  beginner: [
    {
      lesson: 'HTML Semantic Structure',
      exercise: 'Build a semantic blog page using header, main, section, article, and footer.',
      miniProject: 'Personal profile card with responsive layout.',
      quiz: '6 questions on semantic tags and accessibility basics.',
    },
    {
      lesson: 'CSS Flexbox Foundations',
      exercise: 'Create a navbar and hero section aligned with flex containers.',
      miniProject: 'Responsive landing page top section.',
      quiz: '8 questions on main-axis, cross-axis, and spacing.',
    },
    {
      lesson: 'JavaScript Variables and Functions',
      exercise: 'Write utility functions for formatting names and prices.',
      miniProject: 'Simple calculator with clean function structure.',
      quiz: '7 questions on scopes, params, and return values.',
    },
  ],
  intermediate: [
    {
      lesson: 'DOM Event Patterns',
      exercise: 'Implement event delegation for a dynamic todo list.',
      miniProject: 'Interactive FAQ accordion with keyboard support.',
      quiz: '10 questions on bubbling, capturing, and delegation.',
    },
    {
      lesson: 'Async JavaScript and Fetch',
      exercise: 'Fetch posts from an API and handle loading/error states.',
      miniProject: 'Weather widget with retry and fallback UI.',
      quiz: '8 questions on promises, async/await, and error handling.',
    },
    {
      lesson: 'State Management in React',
      exercise: 'Refactor a form using controlled components.',
      miniProject: 'Task board with filters and persisted state.',
      quiz: '10 questions on state flow and component composition.',
    },
  ],
  advanced: [
    {
      lesson: 'Performance Optimization',
      exercise: 'Audit rendering bottlenecks and optimize with memoization.',
      miniProject: 'Fast searchable catalog with debounced input.',
      quiz: '10 questions on profiling and optimization trade-offs.',
    },
    {
      lesson: 'Auth and Access Control',
      exercise: 'Protect routes and handle expired sessions gracefully.',
      miniProject: 'Role-aware dashboard shell with guarded actions.',
      quiz: '9 questions on tokens, sessions, and auth flows.',
    },
    {
      lesson: 'System Design for Web Apps',
      exercise: 'Design API contracts and data models for a learning app.',
      miniProject: 'Scalable notes app architecture document.',
      quiz: '8 questions on caching, queues, and consistency.',
    },
  ],
}

const hashCode = (value) =>
  String(value)
    .split('')
    .reduce((acc, char) => ((acc << 5) - acc + char.charCodeAt(0)) | 0, 0)

function shuffle(array) {
  const copy = [...array]
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1))
    ;[copy[index], copy[randomIndex]] = [copy[randomIndex], copy[index]]
  }
  return copy
}

function normalizeLevel(level) {
  if (!level) return 'beginner'
  const candidate = String(level).toLowerCase()
  if (candidate === 'expert') return 'advanced'
  return dailyPlanCatalog[candidate] ? candidate : 'beginner'
}

function inferDifficulty(index, total) {
  if (total <= 1) return 'medium'
  const progress = index / (total - 1)
  if (progress < 0.34) return 'low'
  if (progress < 0.67) return 'medium'
  return 'high'
}

function loadQuizBankFromContent() {
  if (!fs.existsSync(contentRoot)) {
    return {}
  }

  const bank = {}
  const categories = fs.readdirSync(contentRoot, { withFileTypes: true }).filter((entry) => entry.isDirectory())

  for (const category of categories) {
    const courseId = category.name.toLowerCase()
    const folderPath = path.join(contentRoot, category.name)
    const files = fs
      .readdirSync(folderPath)
      .filter((name) => name.endsWith('.json'))
      .sort((left, right) => left.localeCompare(right))
    const collected = []

    for (let fileIndex = 0; fileIndex < files.length; fileIndex += 1) {
      const fileName = files[fileIndex]
      try {
        const filePath = path.join(folderPath, fileName)
        const raw = fs.readFileSync(filePath, 'utf8')
        const lesson = JSON.parse(raw)
        const lessonQuiz = Array.isArray(lesson.quiz) ? lesson.quiz : []

        for (let index = 0; index < lessonQuiz.length; index += 1) {
          const question = lessonQuiz[index]
          if (!question || !question.question || !Array.isArray(question.options) || typeof question.answer !== 'number') {
            continue
          }

          collected.push({
            id: `${lesson.id || lesson.slug || fileName}-q${index + 1}`,
            courseId,
            lessonId: lesson.id || lesson.slug || fileName,
            chapterSlug: lesson.slug || null,
            chapterTitle: lesson.title || '',
            question: {
              en: question.question,
              hi: question.question,
              hinglish: question.question,
            },
            options: question.options,
            answer: question.answer,
            explanation: {
              en: question.explanation || '',
              hi: question.explanation || '',
              hinglish: question.explanation || '',
            },
            difficulty: inferDifficulty(fileIndex, files.length),
          })
        }
      } catch (error) {
        console.error(`Failed to parse quiz content from ${fileName}:`, error.message)
      }
    }

    bank[courseId] = collected
  }

  return bank
}

let quizBank = loadQuizBankFromContent()

export function refreshQuizBank() {
  quizBank = loadQuizBankFromContent()
  return quizBank
}

export function getCourseIds() {
  return Object.keys(quizBank)
}

export function getQuizCount(courseId) {
  return (quizBank[courseId] || []).length
}

export function getRandomQuiz({ courseId = 'html', count = 8 }) {
  const available = quizBank[courseId] || []
  const safeCount = Math.min(Math.max(Number(count) || 8, 1), 100)
  return shuffle(available).slice(0, safeCount)
}

export function planForToday({ level = 'beginner', language = 'en', focus = '' } = {}) {
  const now = new Date()
  const dateKey = `${now.getUTCFullYear()}-${now.getUTCMonth() + 1}-${now.getUTCDate()}`
  const normalizedLevel = normalizeLevel(level)
  const source = dailyPlanCatalog[normalizedLevel]
  const index = Math.abs(hashCode(`${dateKey}:${normalizedLevel}:${language}:${focus}`)) % source.length
  const base = source[index]
  const focusText = focus ? ` Focus area: ${focus}.` : ''

  return {
    ...base,
    level: normalizedLevel,
    language,
    generatedAt: now.toISOString(),
    lesson: `${base.lesson}${focusText}`,
  }
}
