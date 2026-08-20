import { ChatResult, chatResultSchema } from './schema';
import { createChatModel } from './langChainModel';

export async function chatStructured(query: string): Promise<ChatResult> {
  const { model } = createChatModel();

  const systemPrompt =
    'You are a helpful assistant that can answer questions and help with tasks.';

  const userPrompt =
    `Summarize for a beginner:\n` +
    `Query: ${query}\n` +
    `Return fields: summary (short paragraph), confidence (0-1)`;

  const structured = model.withStructuredOutput(chatResultSchema);

  const response = await structured.invoke([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ]);

  return response;
}
