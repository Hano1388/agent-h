import { z } from 'zod';

// legal contract backend --> AI models --> frontend

// tavily search results
export const WebSearchResultSchema = z.object({
  title: z.string().min(1),
  url: z.url(),
  snippet: z.string().optional().default(''),
});

export const WebSearchResultsSchema = z.array(WebSearchResultSchema).max(10);

export type WebSearchResult = z.infer<typeof WebSearchResultSchema>;

export const FetchedPageInputSchema = z.object({
  url: z.url(),
});

export const FetchedPageOutputSchema = z.object({
  url: z.url(),
  content: z.string().min(1),
});

export const SummaryInputSchema = z.object({
  text: z.string().min(50, 'Text must be at least 50 characters long'),
});

export const SummaryOutputSchema = z.object({
  summary: z.string().min(1),
});

export const SearchInputSchema = z.object({
  q: z.string().min(5, 'Query must be at least 5 characters long'),
});

export type SearchInput = z.infer<typeof SearchInputSchema>;
