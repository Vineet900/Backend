import { env } from '../config/env.js'

export function buildHealthPayload() {
  return {
    ok: true,
    service: 'devguru-api',
    dynamic: true,
    llmProvider:
      env.llmProvider ||
      (env.openrouterApiKey ? 'openrouter(auto)' : env.openaiApiKey ? 'openai(auto)' : 'fallback'),
    timestamp: new Date().toISOString(),
  }
}
