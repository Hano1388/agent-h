import { runAgent } from '@/searchAgent/runnableChain';
import { SearchInputSchema } from '@/utils/schemas';
import { Router } from 'express';

export const searchLCELRouter = Router();

searchLCELRouter.post('/', async (req, res) => {
  try {
    const input = SearchInputSchema.parse(req.body);
    const answer = await runAgent(input);
    res.status(200).json(answer);
  } catch (error) {
    const msg =
      error instanceof Error ? error.message : 'An unknown error occurred';
    res.status(500).json({ error: msg });
  }
});
