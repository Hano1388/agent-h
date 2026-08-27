import { describe, expect, it } from 'vitest';
import {
  SearchAnswerSchema,
  SearchInputSchema,
  WebSearchResultSchema,
  WebSearchResultsSchema,
} from './schemas';

describe('SearchInputSchema', () => {
  it('accepts queries with at least 5 characters', () => {
    const result = SearchInputSchema.safeParse({ q: 'hello world' });
    expect(result.success).toBe(true);
  });

  it('rejects queries shorter than 5 characters', () => {
    const result = SearchInputSchema.safeParse({ q: 'hi' });
    expect(result.success).toBe(false);
  });
});

describe('SearchAnswerSchema', () => {
  it('accepts a valid direct answer', () => {
    const result = SearchAnswerSchema.safeParse({
      answer: 'HTTP is a protocol for transferring hypertext.',
      sources: [],
      mode: 'direct',
    });
    expect(result.success).toBe(true);
  });

  it('accepts a valid web answer with source URLs', () => {
    const result = SearchAnswerSchema.safeParse({
      answer: 'Here are the top colleges.',
      sources: ['https://example.com/article'],
      mode: 'web',
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid source URLs', () => {
    const result = SearchAnswerSchema.safeParse({
      answer: 'Answer text',
      sources: ['not-a-url'],
      mode: 'web',
    });
    expect(result.success).toBe(false);
  });
});

describe('WebSearchResultsSchema', () => {
  it('parses Tavily-shaped results', () => {
    const result = WebSearchResultsSchema.safeParse([
      {
        title: 'Example',
        url: 'https://example.com',
        snippet: 'Snippet text',
      },
    ]);
    expect(result.success).toBe(true);
  });

  it('rejects more than 10 results', () => {
    const results = Array.from({ length: 11 }, (_, index) => ({
      title: `Result ${index}`,
      url: `https://example.com/${index}`,
      snippet: '',
    }));

    const parsed = WebSearchResultsSchema.safeParse(results);
    expect(parsed.success).toBe(false);
  });

  it('requires a valid URL on each result', () => {
    const result = WebSearchResultSchema.safeParse({
      title: 'Bad result',
      url: 'not-a-url',
      snippet: '',
    });
    expect(result.success).toBe(false);
  });
});
