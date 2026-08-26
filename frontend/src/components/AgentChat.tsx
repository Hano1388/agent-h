'use client';

import { useEffect, useRef, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

type SearchMode = 'direct' | 'web';

type Exchange = {
  id: string;
  query: string;
  answer: string;
  sources: string[];
  mode: SearchMode;
};

function isSearchMode(value: unknown): value is SearchMode {
  return value === 'direct' || value === 'web';
}

export function AgentChat() {
  const [query, setQuery] = useState('');
  const [exchanges, setExchanges] = useState<Exchange[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const threadEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    threadEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [exchanges, isLoading]);

  const handleAsk = async () => {
    const trimmed = query.trim();
    if (!trimmed || isLoading) return;

    if (trimmed.length < 5) {
      setError('Please enter at least 5 characters.');
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ q: trimmed }),
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        throw new Error(data.error || 'Something went wrong');
      }

      if (typeof data.answer !== 'string' || !isSearchMode(data.mode)) {
        throw new Error('Unexpected response from agent');
      }

      const sources = Array.isArray(data.sources)
        ? data.sources.filter((source: unknown): source is string => typeof source === 'string')
        : [];

      setExchanges((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          query: trimmed,
          answer: data.answer,
          sources,
          mode: data.mode,
        },
      ]);
      setQuery('');
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to reach the agent',
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-dvh flex-col bg-[radial-gradient(ellipse_at_top,_#f4f7fb_0%,_#eef1f5_45%,_#e8ebf0_100%)]">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,transparent_0%,rgba(255,255,255,0.35)_100%)]" />

      <div className="relative mx-auto flex w-full max-w-2xl flex-1 flex-col px-4 pb-28 pt-10 sm:px-6">
        <header className="mb-8 text-center animate-in fade-in slide-in-from-top-2 duration-500">
          <p className="mb-2 text-xs font-medium tracking-[0.22em] text-zinc-500 uppercase">
            Agent
          </p>
          <h1 className="text-4xl font-semibold tracking-tight text-zinc-900 sm:text-5xl">
            Agent H
          </h1>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-zinc-500 sm:text-base">
            An AI agent that can answer your questions
          </p>
        </header>

        <main className="flex flex-1 flex-col gap-5">
          {exchanges.length === 0 && !isLoading ? (
            <div className="flex flex-1 items-center justify-center py-16 text-center animate-in fade-in duration-700">
              <p className="max-w-sm text-sm text-zinc-400">
                Ask anything below. Answers may come from the model directly or
                from a live web search, with sources when available.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {exchanges.map((exchange, index) => (
                <article
                  key={exchange.id}
                  className="flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-2 duration-400"
                  style={{ animationDelay: `${Math.min(index * 40, 200)}ms` }}
                >
                  <div className="flex justify-end">
                    <div className="max-w-[85%] rounded-2xl rounded-br-md bg-zinc-900 px-4 py-2.5 text-sm leading-relaxed text-zinc-50 shadow-sm">
                      {exchange.query}
                    </div>
                  </div>

                  <div className="flex justify-start">
                    <div className="max-w-[90%] rounded-2xl rounded-bl-md border border-zinc-200/80 bg-white/90 px-4 py-3 shadow-[0_8px_30px_rgba(15,23,42,0.04)] backdrop-blur-sm">
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <span className="text-xs font-medium tracking-wide text-zinc-400 uppercase">
                          Answer
                        </span>
                        <Badge
                          variant={exchange.mode === 'web' ? 'default' : 'secondary'}
                          className="rounded-md"
                        >
                          {exchange.mode === 'web' ? 'Web search' : 'Direct'}
                        </Badge>
                      </div>
                      <p className="text-sm leading-relaxed text-zinc-800 whitespace-pre-wrap">
                        {exchange.answer}
                      </p>
                      {exchange.sources.length > 0 && (
                        <div className="mt-3 border-t border-zinc-100 pt-3">
                          <p className="mb-1.5 text-xs font-medium tracking-wide text-zinc-400 uppercase">
                            Sources
                          </p>
                          <ul className="flex flex-col gap-1">
                            {exchange.sources.map((source) => (
                              <li key={source}>
                                <a
                                  href={source}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="break-all text-xs text-zinc-600 underline-offset-2 hover:text-zinc-900 hover:underline"
                                >
                                  {source}
                                </a>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </article>
              ))}

              {isLoading && (
                <div className="flex justify-start animate-in fade-in duration-300">
                  <div className="rounded-2xl rounded-bl-md border border-zinc-200/80 bg-white/90 px-4 py-3 text-sm text-zinc-400 shadow-sm">
                    Searching and thinking…
                  </div>
                </div>
              )}
            </div>
          )}

          {error && (
            <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}

          <div ref={threadEndRef} />
        </main>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-10 border-t border-zinc-200/70 bg-white/80 backdrop-blur-xl">
        <form
          className="mx-auto flex w-full max-w-2xl items-center gap-2 px-4 py-4 sm:px-6"
          onSubmit={(event) => {
            event.preventDefault();
            void handleAsk();
          }}
        >
          <Input
            type="text"
            placeholder="Ask a question…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            disabled={isLoading}
            className={cn(
              'h-11 flex-1 rounded-xl border-zinc-200 bg-white px-4 text-sm shadow-sm',
              'placeholder:text-zinc-400',
            )}
            aria-label="Ask Agent H"
          />
          <Button
            type="submit"
            disabled={isLoading || query.trim().length < 5}
            className="h-11 rounded-xl px-5"
          >
            {isLoading ? 'Asking…' : 'Ask'}
          </Button>
        </form>
      </div>
    </div>
  );
}
