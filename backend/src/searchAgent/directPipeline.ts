// call tavily
// fetch
// summarize
// compose

import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { RunnableLambda } from '@langchain/core/runnables';
import type { candidate } from './types';
import { getChatModel } from '../shared/models';

export const directPath = RunnableLambda.from(
  async (input: { q: string; mode: 'direct' | 'web' }): Promise<candidate> => {
    const model = getChatModel({ temperature: 0.2 });

    const res = await model.invoke([
      new SystemMessage(
        [
          'You give a brief, clear, and beginner friendly answer',
          'If not sure, please say so',
        ].join('\n'),
      ),
      new HumanMessage(input.q),
    ]);

    const directAnswer = (
      typeof res.content === 'string' ? res.content : String(res.content)
    ).trim();

    return {
      answer: directAnswer,
      sources: [],
      mode: 'direct',
    };
  },
);
