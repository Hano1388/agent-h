// answer, sources
// last touchup, validate answer

import { RunnableLambda } from '@langchain/core/runnables';
import { SystemMessage, HumanMessage } from '@langchain/core/messages';
import { candidate } from './types';
import { getChatModel } from '../shared/models';
import { SearchAnswerSchema } from '@/utils/schemas';

export const validateAndRefine = RunnableLambda.from(
  async (candidate: candidate) => {
    const lastDraft = {
      answer: candidate.answer,
      sources: candidate.sources ?? [],
      mode: candidate.mode,
    };

    const parsedLastDraft = SearchAnswerSchema.safeParse(lastDraft);

    if (parsedLastDraft.success) return parsedLastDraft.data;

    // fix if the draft is invalid
    const fixedDraft = fixInvalidSearchAnswer(parsedLastDraft.error);

    const validatedDraft = SearchAnswerSchema.safeParse(fixedDraft);
    if (validatedDraft.success) return validatedDraft.data;

    throw new Error('Failed to fix invalid search answer');
  },
);

// fix invalid search answer
const fixInvalidSearchAnswer = async (
  object: any,
): Promise<{ answer: string; sources: string[]; mode: 'direct' | 'web' }> => {
  const model = getChatModel({ temperature: 0.2 });
  const res = await model.invoke([
    new SystemMessage(
      [
        'You are a helpful assistant that fixes invalid search answers.',
        'respond only with valid JSON object of type SearchAnswer',
        'Schema: { answer: string, sources: string[] (urls as strings) }',
      ].join('\n'),
    ),
    new HumanMessage(
      [
        'Make this exactly match the schema and make sure sources is an array of urls as strings',
        'The input is:',
        JSON.stringify(object),
      ].join('\n'),
    ),
  ]);

  const text =
    typeof res.content === 'string' ? res.content : String(res.content);

  const parsed = SearchAnswerSchema.safeParse(JSON.parse(text));
  if (parsed.success) {
    return {
      answer: parsed.data.answer,
      sources: Array.isArray(parsed?.data?.sources)
        ? parsed?.data?.sources?.map((source) => String(source))
        : [],
      mode: parsed.data.mode,
    };
  }
  throw new Error('Failed to fix invalid search answer');
};
