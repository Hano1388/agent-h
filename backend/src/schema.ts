import { z } from 'zod';

export const chatResultSchema = z.object({
  summary: z.string().min(1).max(1000),
  confidence: z.number().min(0).max(1),
});

export type ChatResult = z.infer<typeof chatResultSchema>;
