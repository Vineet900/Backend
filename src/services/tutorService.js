import { env } from '../config/env.js'
import { planForToday } from './learningService.js'

function fallbackTutor({ question, language = 'en', level = 'beginner' }) {
  const hintByTopic = [
    { pattern: /react|component|hook/i, tip: 'Break UI into reusable components and track state transitions before coding.' },
    { pattern: /javascript|js|function|array|object/i, tip: 'Start with a tiny input/output example and test each function in isolation.' },
    { pattern: /css|flex|grid|layout/i, tip: 'Use browser devtools to inspect computed styles and reduce layout issues incrementally.' },
    { pattern: /api|fetch|axios|request/i, tip: 'Handle loading, success, and error explicitly and validate payload shape before rendering.' },
  ]

  const topic = hintByTopic.find((item) => item.pattern.test(question))
  const defaultTip = 'Split your problem into concept, syntax, and one runnable example.'
  const levelPlan = planForToday({ level, language, focus: question.slice(0, 24) })

  return `Quick guide: ${topic?.tip || defaultTip} Next lesson suggestion: ${levelPlan.lesson}. Practice: ${levelPlan.exercise}`
}

async function callOpenAIChat({ question, language, level }) {
  if (!env.openaiApiKey) {
    return null
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${env.openaiApiKey}`,
    },
    body: JSON.stringify({
      model: env.openaiModel,
      messages: [
        {
          role: 'system',
          content:
            'You are a concise coding tutor. Respond in plain text with clear explanation and one small example. Keep response under 180 words.',
        },
        {
          role: 'user',
          content: `Language preference: ${language}. Learner level: ${level}. Question: ${question}`,
        },
      ],
      temperature: 0.5,
    }),
  })

  if (!response.ok) {
    const body = await response.text()
    throw new Error(`OpenAI API failed (${response.status}): ${body}`)
  }

  const json = await response.json()
  return json.choices?.[0]?.message?.content?.trim() || null
}

async function callOpenRouterChat({ question, language, level }) {
  if (!env.openrouterApiKey) {
    return null
  }

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${env.openrouterApiKey}`,
      'HTTP-Referer': env.openrouterReferer,
      'X-Title': 'DevSchool Pro Tutor',
    },
    body: JSON.stringify({
      model: env.openrouterModel,
      messages: [
        {
          role: 'system',
          content:
            'You are a concise coding tutor. Respond in plain text with clear explanation and one small example. Keep response under 180 words.',
        },
        {
          role: 'user',
          content: `Language preference: ${language}. Learner level: ${level}. Question: ${question}`,
        },
      ],
      temperature: 0.5,
    }),
  })

  if (!response.ok) {
    const body = await response.text()
    throw new Error(`OpenRouter API failed (${response.status}): ${body}`)
  }

  const json = await response.json()
  return json.choices?.[0]?.message?.content?.trim() || null
}

export async function getTutorAnswer({ question, language, level }) {
  if (env.llmProvider === 'openai') {
    return (await callOpenAIChat({ question, language, level })) || fallbackTutor({ question, language, level })
  }

  if (env.llmProvider === 'openrouter') {
    return (await callOpenRouterChat({ question, language, level })) || fallbackTutor({ question, language, level })
  }

  const viaOpenRouter = await callOpenRouterChat({ question, language, level }).catch(() => null)
  if (viaOpenRouter) {
    return viaOpenRouter
  }

  const viaOpenAI = await callOpenAIChat({ question, language, level }).catch(() => null)
  if (viaOpenAI) {
    return viaOpenAI
  }

  return fallbackTutor({ question, language, level })
}
