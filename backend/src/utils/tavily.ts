import { WebSearchResult, WebSearchResultsSchema } from './schemas';
import { env } from '../shared/env';
import { tavily } from '@tavily/core';

const TAVILY_API_KEY = env.TAVILY_API_KEY;

export const tavilySearchUtil = async (
  query: string,
): Promise<WebSearchResult[]> => {
  if (!TAVILY_API_KEY) {
    throw new Error('TAVILY_API_KEY is not set');
  } else if (!query) {
    return [];
  }

  try {
    const tvly = tavily({ apiKey: TAVILY_API_KEY });

    const response = await tvly.search(query, {
      searchDepth: 'basic',
      resultsPerQuery: 10,
    });
    return WebSearchResultsSchema.parse(response.results);
  } catch (error) {
    console.error('Error searching the web:', error);
    throw error;
  }
};
