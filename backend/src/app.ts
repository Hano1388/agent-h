import express from 'express';
import cors from 'cors';
import { searchLCELRouter } from './routes/searchLCEL';

export function createApp() {
  const app = express();
  app.use(
    cors({
      origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    }),
  );
  app.use(express.json());
  app.use('/search', searchLCELRouter);
  return app;
}
