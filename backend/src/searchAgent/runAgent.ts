// routerStrategy --> routerStep
// { q, mode --> web | direct }

// web --> webPath
// direct --> directPath

// final validation --> validateAndRefine --> JSON object

// LCEL chain -->
// A, B, C, D, E, ....

import { RunnableBranch, RunnableSequence } from '@langchain/core/runnables';
import { routerStep } from './routeStrategy';
import { webPath } from './webPipeline';
import { directPath } from './directPipeline';
import { validateAndRefine } from './finalValidation';
import { SearchAnswer, SearchInput } from '@/utils/schemas';

const branch = RunnableBranch.from<{ q: string; mode: 'direct' | 'web' }, any>([
  [(input) => input.mode === 'web', webPath],
  directPath,
]);

export const runnableChain = RunnableSequence.from([
  routerStep,
  branch,
  validateAndRefine,
]);

export async function runAgent(input: SearchInput): Promise<SearchAnswer> {
  return await runnableChain.invoke(input);
}
