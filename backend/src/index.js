import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { ping } from './lib/db.js';
import authRouter from './routes/auth.js';
import workshopsRouter from './routes/workshops.js';
import requestsRouter from './routes/requests.js';
import adminRouter from './routes/admin.js';
import workersRouter from './routes/workers.js';

const app = express();
const PORT = process.env.PORT || 8000;

app.use(cors({ origin: process.env.CORS_ORIGIN?.split(',') ?? '*', credentials: true }));
app.use(express.json());

app.get('/api/health', async (req, res) => {
  try {
    const ok = await ping();
    res.json({ ok });
  } catch (e) {
    res.status(500).json({ ok: false, error: 'DB unreachable' });
  }
});

app.use('/api/auth', authRouter);
app.use('/api/workshops', workshopsRouter);
app.use('/api/requests', requestsRouter);
app.use('/api/admin', adminRouter);
app.use('/api/workers', workersRouter);

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(PORT, () => console.log(`Backend running on :${PORT}`));
