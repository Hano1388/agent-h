import { afterEach, describe, expect, it, vi } from 'vitest';
import { searchTheWeb } from './searchTheWeb';

describe('searchTheWeb', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('rejects plain-text queries that are not URLs', async () => {
    await expect(
      searchTheWeb('Top 10 colleges in Kurdistan Region of Iraq'),
    ).rejects.toThrow('Invalid URL');
  });

  it('rejects non-http protocols', async () => {
    await expect(searchTheWeb('ftp://example.com/file')).rejects.toThrow(
      'only http and https urls are supported',
    );
  });

  it('fetches and returns page content for valid URLs', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        headers: new Headers({ 'content-type': 'text/html' }),
        text: async () => '<html><body><p>Hello   world</p></body></html>',
      }),
    );

    const result = await searchTheWeb('https://example.com');

    expect(result.url).toBe('https://example.com/');
    expect(result.content).toContain('Hello world');
  });
});
