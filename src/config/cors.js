import { env } from './env.js'

export const corsOptions = {
  origin: [
    'http://localhost:5173', // Frontend
    'http://localhost:5174', // Admin (Default)
    'http://localhost:5175', // Admin (Fallback)
  ],
  credentials: true,
}
