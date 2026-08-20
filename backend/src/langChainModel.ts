import { ChatOpenAI } from '@langchain/openai';
import { ChatGoogle } from '@langchain/google';
import { loadEnv } from '@/env';

export type Provider = 'google' | 'openai';

export function createChatModel(): { provider: Provider; model: any } {
  loadEnv();
  const forced = (process.env.FORCED_PROVIDER || '').toLowerCase() as Provider;

  const hasOpenAI = !!process.env.OPENAI_API_KEY;
  const hasGoogle = !!process.env.GOOGLE_API_KEY;

  const base = { temperature: 0 as const };

  if (forced === 'openai' || (!forced && hasOpenAI)) {
    return {
      provider: 'openai',
      model: new ChatOpenAI({
        apiKey: process.env.OPENAI_API_KEY,
        model: 'gpt-4o-mini',
        ...base,
      }),
    };
  } else if (forced === 'google' || (!forced && hasGoogle)) {
    return {
      provider: 'google',
      model: new ChatGoogle({
        apiKey: process.env.GOOGLE_API_KEY,
        model: 'gemini-2.5-flash',
        ...base,
      }),
    };
  } else {
    return {
      provider: 'openai',
      model: new ChatOpenAI({
        apiKey: process.env.OPENAI_API_KEY,
        model: 'gpt-4o-mini',
        ...base,
      }),
    };
  }
}
