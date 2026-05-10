import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).default('4000'),
  SUPABASE_URL: z.string().url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string(),
  SUPABASE_JWT_SECRET: z.string(),
  FRONTEND_URL: z.string().url().default('http://localhost:5173'),
  JWT_EXPIRE: z.string().default('30d'),
  OPENROUTER_API_KEY: z.string().optional(),
});

const envVars = envSchema.safeParse(process.env);

if (!envVars.success) {
  console.log('❌ Invalid environment variables:', JSON.stringify(envVars.error.format(), null, 2));
  process.exit(1);
}

export const config = {
  env: envVars.data.NODE_ENV,
  port: envVars.data.PORT,
  supabase: {
    url: envVars.data.SUPABASE_URL,
    serviceRole: envVars.data.SUPABASE_SERVICE_ROLE_KEY,
    jwtSecret: envVars.data.SUPABASE_JWT_SECRET,
  },
  cors: {
    origin: envVars.data.FRONTEND_URL,
  },
  jwt: {
    expire: envVars.data.JWT_EXPIRE,
  },
  ai: {
    openRouterKey: envVars.data.OPENROUTER_API_KEY,
  }
};
