// Search the web tool

import { WebSearchResult, WebSearchResultsSchema } from './schemas';
import { tavilySearchUtil } from './tavily';

/*
{
    "query": "What is the capital of France?",
    This will call (tavily search api) and return the results
    "results": [
        {
            "title": "France",
            "url": "https://en.wikipedia.org/wiki/France",
            "snippet": "France is a country in Europe."
        }
    ]
}
*/

export async function webSearch(q: string): Promise<WebSearchResult[]> {
  const query = (q ?? '').trim();
  if (!query) {
    return [];
  }

  const results = await tavilySearchUtil(query);
  return WebSearchResultsSchema.parse(results);
}
