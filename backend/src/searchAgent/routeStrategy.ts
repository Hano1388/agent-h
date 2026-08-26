// To route the agent to right path (Direct (LLM) or Web (browser) path)
import { webPathPatterns } from '../constants';
import { SearchInputSchema } from '../utils/schemas';
import { RunnableLambda } from '@langchain/core/runnables';

export const routeStrategy = (q: string): 'direct' | 'web' => {
  const trimmedQuery = q.trim().toLowerCase();

  const isLongQuery = trimmedQuery.length > 100;

  const recentYearRegex = /\b20(2[4-9])\b/.test(trimmedQuery);
  const webPathPatternsMatches = webPathPatterns.some((pattern) =>
    pattern.test(trimmedQuery),
  );

  if (
    isLongQuery ||
    recentYearRegex ||
    webPathPatternsMatches ||
    webPathPatterns.length === 0
  ) {
    return 'web';
  }

  return 'direct';
};

// routerstep
// LCEL chain
// Runnable function
// Route strategy
// Route strategy

export const routerStep = RunnableLambda.from(async (input: { q: string }) => {
  const { q } = SearchInputSchema.parse(input);

  // decide mode
  const mode = routeStrategy(q);
  return {
    q,
    mode,
  };
});
