import { SummaryInputSchema, SummaryOutputSchema } from './schemas';
import { getChatModel } from '../shared/models';
import { SystemMessage, HumanMessage } from '@langchain/core/messages';

export async function summarize(text: string) {
  const { text: rawSummary } = SummaryInputSchema.parse({ text });

  const clippedSummary = clipped(rawSummary, 100000);

  const model = getChatModel({ temperature: 0.1 });

  // Ask the model to summarize the text in a concise manner
  const summary = await model.invoke([
    new SystemMessage(
      [
        'You are a helpful assistant that summarizes text in a concise manner.',
        'Guidelines:',
        "- be factual and neutral, don't add any personal opinions or bias or marketing language",
        '- 5-8 sentences; no lists unless absolutely necessary',
        '- Do not invent sources or statistics; you only summarize the text provided',
        '- Keep it readable for beginners; avoid technical jargon and complex sentences',
      ].join('\n'),
    ),
    new HumanMessage(
      [
        'Summarize the following text for a beginner friendly audience:',
        'Focus on key facts and remove fluff or jargon',
        'TEXT: ',
        clippedSummary,
      ].join('\n'),
    ),
  ]);

  const rawModelResponse =
    typeof summary.content === 'string'
      ? summary.content
      : String(summary.content);

  const modelResponse = normalizedSummary(rawModelResponse);

  return SummaryOutputSchema.parse({ summary: modelResponse });
}

const clipped = (text: string, max: number) => {
  return text.length > max ? text.slice(0, max) + '...' : text;
};

const normalizedSummary = (text: string) => {
  const trimmed = text
    .replace(/\s+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  return trimmed.slice(0, 2500);
};
