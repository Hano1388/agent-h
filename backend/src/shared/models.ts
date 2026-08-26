import { env } from './env';
import { ChatOpenAI } from '@langchain/openai';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';

import type { BaseChatModel } from '@langchain/core/language_models/chat_models';

type ModelOpts = {
  temperature?: number;
  maxTokens?: number;
};

export function getChatModel(opts: ModelOpts = {}): BaseChatModel {
  const temperature = opts?.temperature ?? 0.2;

  switch (env.MODEL_PROVIDER) {
    case 'gemini':
      return new ChatGoogleGenerativeAI({
        model: env.GEMINI_MODEL,
        apiKey: env.GOOGLE_API_KEY,
        temperature,
      });
    case 'openai':
      return new ChatOpenAI({
        model: env.OPENAI_MODEL,
        apiKey: env.OPENAI_API_KEY,
        temperature,
      });
    default:
      return new ChatOpenAI({
        model: env.OPENAI_MODEL,
        apiKey: env.OPENAI_API_KEY,
        temperature,
      });
  }
}
