import express from 'express';
import cors from 'cors';
import { loadEnv } from './env';
import { callProvider } from './provider';
import { chatStructured } from './chatCore';

loadEnv();

const app = express();
app.use(
  cors({
    origin: ['http://localhost:3000'],
    methods: ['GET', 'POST', 'OPTIONS', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: false,
  }),
);
app.use(express.json());
// app.get('/', async (req, res) => {
//   const gemini = await callProvider('google');
//   const openai = await callProvider('openai');
//   res.json({ gemini, openai });
// });

app.post('/ask-agent', async (req, res) => {
  try {
    const { query } = req.body;
    console.log(query);
    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }
    const result = await chatStructured(query as string);
    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

const PORT = process.env.PORT || 3030;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
