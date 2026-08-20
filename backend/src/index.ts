import { loadEnv } from './env';
import { callProvider } from './provider';
import express from 'express';

loadEnv();

const app = express();

app.get('/', async (req, res) => {
  const gemini = await callProvider('google');
  const openai = await callProvider('openai');
  res.json({ gemini, openai });
});

app.listen(3030, () => {
  console.log('Server is running on port 3000');
});
