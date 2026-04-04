import { z } from 'zod';

const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().url(),
  
  // APIs
  GOOGLE_MAPS_API_KEY: z.string().min(1),
  DYNADOT_ACCOUNT_API_KEY: z.string().min(1),
  
  // App Config
  NEXT_PUBLIC_APP_URL: z.string().url(),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  
  // Optional
  DEMO_MODE: z.string().optional().transform(val => val === 'true'),
});

// Server-side environment variables
export const env = envSchema.parse({
  DATABASE_URL: process.env.DATABASE_URL,
  GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY,
  DYNADOT_ACCOUNT_API_KEY: process.env.DYNADOT_ACCOUNT_API_KEY,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  NODE_ENV: process.env.NODE_ENV,
  DEMO_MODE: process.env.DEMO_MODE,
});

// Public client-side variables
export const publicEnv = {
  appUrl: process.env.NEXT_PUBLIC_APP_URL,
};
