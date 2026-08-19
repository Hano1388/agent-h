type Provider = 'openai' | 'google';

type HelloReturn = {
  ok: true;
  provider: Provider;
  module: string;
  message: string;
};

type GeminiGenerateContent = {
  candidates?: Array<{ content: { parts?: Array<{ text?: string }> } }>;
};

async function geminiReturn(): Promise<HelloReturn> {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    throw new Error('API key not found');
  }

  const model = 'gemini-3.5-flash-lite';
  const url =
    'https://generativelanguage.googleapis.com/v1beta/models/' +
    model +
    ':generateContent?key=' +
    apiKey;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [{ text: 'Hello, how are you?' }],
        },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`Gemini ${response.statusText}: ${await response.text()}`);
  }

  const data = (await response.json()) as GeminiGenerateContent;
  const message = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

  return {
    ok: true,
    provider: 'google',
    module: 'gemini',
    message: String(message).trim(),
  };
}

type OpenAiChatCompletion = {
  choices?: Array<{ message: { content?: string } }>;
};

async function openAiReturn(): Promise<HelloReturn> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('API key not found');
  }
  const url = 'https://api.openai.com/v1/chat/completions';
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: 'Hello, how are you?' }],
    }),
  });
  if (!response.ok) {
    throw new Error(`OpenAI ${response.statusText}: ${await response.text()}`);
  }
  const data = (await response.json()) as OpenAiChatCompletion;
  const message = data.choices?.[0]?.message?.content || '';
  return {
    ok: true,
    provider: 'openai',
    module: 'openai',
    message: String(message).trim(),
  };
}

async function callProvider(provider: Provider): Promise<HelloReturn> {
  const providerEnv = (process.env.PROVIDER || '').toLowerCase() as Provider;
  if (providerEnv === 'google') {
    return geminiReturn();
  } else if (providerEnv === 'openai') {
    return openAiReturn();
  } else {
    throw new Error(`Invalid provider: ${provider}, expected google or openai`);
  }
}

export { callProvider };
