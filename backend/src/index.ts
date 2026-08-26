import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { searchLCELRouter } from './routes/searchLCEL';

const app = express();
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  }),
);
app.use(express.json());
app.use('/search', searchLCELRouter);

const port = process.env.PORT || 3030;
app.listen(port, () => console.log(`Server is running on port ${port}`));
