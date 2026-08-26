// Top 10 types of honey in the world

// 1. Browse the web for the most relevant information
// 2. Visit every result page and extract the most relevant information
// 3. Summarize the most relevant information
// 4. Return the summary

const setTopResults = 5;

import { RunnableLambda, RunnableSequence } from '@langchain/core/runnables';
import { SystemMessage, HumanMessage } from '@langchain/core/messages';

import { SearchInputSchema } from '../utils/schemas';
import { searchTheWeb } from '../utils/searchTheWeb';
import { summarize } from '../utils/summarize';
import { getChatModel } from '../shared/models';
import type { candidate } from './types';

export const webSearchStep = RunnableLambda.from(
  async (input: { q: string; mode: 'direct' | 'web' }) => {
    const { q } = SearchInputSchema.parse(input);

    const results = await searchTheWeb(q);
    return {
      ...input,
      results,
    };
  },
);

export const summarizeStep = RunnableLambda.from(
  async (input: { q: string; mode: 'direct' | 'web'; results: any }) => {
    if (!Array.isArray(input.results) || input.results.length === 0) {
      return {
        ...input,
        summaries: [],
        fallback: 'No results found' as const,
      };
    }

    const topResults = input.results.slice(0, setTopResults);

    const settledResults = await Promise.allSettled(
      topResults.map(async (result: any) => {
        const extracted = await searchTheWeb(result.url);

        const summarized = await summarize(extracted.content);
        return {
          url: result.url,
          summary: summarized.summary,
        };
      }),
    );

    const settledResultsPageSummaries = settledResults
      .filter((result) => result.status === 'fulfilled')
      .map((result) => result.value);

    return {
      ...input,
      summaries: settledResultsPageSummaries,
      fallback:
        settledResultsPageSummaries.length > 0
          ? undefined
          : ('No summaries found' as const),
    };
  },
);

// compose step
// { q, pageSummaries: [{ url, summary }], mode, fallback }
//  candidate --> answer, sources, mode

export const composeStep = RunnableLambda.from(
  async (input: {
    q: string;
    pageSummaries: { url: string; summary: string }[];
    mode: 'web' | 'direct';
    fallback: string | undefined;
  }): Promise<candidate> => {
    const model = getChatModel({ temperature: 0.2 });

    if (!input.pageSummaries || input.pageSummaries.length === 0) {
      const directResponseFromModel = await model.invoke([
        new SystemMessage(
          [
            'You give a brief, clear, and beginner friendly answer',
            'If not sure, please say so',
          ].join('\n'),
        ),
        new HumanMessage(input.q),
      ]);

      const directAnswer = (
        typeof directResponseFromModel.content === 'string'
          ? directResponseFromModel.content
          : String(directResponseFromModel.content)
      ).trim();

      return {
        answer: directAnswer,
        sources: [],
        mode: 'direct',
      };
    }

    const webResponseFromModel = await model.invoke([
      new SystemMessage(
        [
          'You give a brief, clear, concise answer based on provided page summaries',
          '- Be accurate and neutral',
          '- 5-8 sentences max',
          '- Use only information from the provided page summaries, do not invent new facts',
        ].join('\n'),
      ),
      new HumanMessage(
        [
          `Question: ${input.q}`,
          `Summaries: ${JSON.stringify(input.pageSummaries, null, 2)}`,
        ].join('\n'),
      ),
    ]);

    const finalAnswer = (
      typeof webResponseFromModel.content === 'string'
        ? webResponseFromModel.content
        : String(webResponseFromModel.content)
    ).trim();

    return {
      answer: finalAnswer,
      sources: input.pageSummaries.map((summary) => summary.url),
      mode: 'web',
    };
  },
);

export const webPath = RunnableSequence.from([
  webSearchStep,
  summarizeStep,
  composeStep,
]);
