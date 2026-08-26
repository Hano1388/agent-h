import { z } from 'zod';

const envSchema = z.object({
  PORT: z.string().transform(Number),
  ALLOWED_ORIGIN: z.url().default('http://localhost:3000'),
  MODEL_PROVIDER: z.enum(['openai', 'gemini']).default('gemini'),
  OPENAI_API_KEY: z.string().optional(),
  GOOGLE_API_KEY: z.string().optional(),
  OPENAI_MODEL: z.string().default('gpt-4o-mini'),
  GEMINI_MODEL: z.string().default('gemini-2.0-flash-lite'),
  SEARCH_PROVIDER: z.string().default('tavily'),
  TAVILY_API_KEY: z.string().optional(),
});

export const env = envSchema.parse(process.env);
