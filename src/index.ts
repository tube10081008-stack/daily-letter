// src/index.ts
import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { serveStatic } from '@hono/node-server/serve-static';
import dotenv from 'dotenv';
import { db } from './utils/db.js';
import diaryRoutes from './routes/diary.js';
import phraseRoutes from './routes/phrases.js';
import authRoutes from './routes/auth.js';
import { authMiddleware } from './middleware/auth.js';
import { startScheduler } from './services/scheduler.js';

dotenv.config();

const app = new Hono();

// CORS 설정
app.use('/*', cors());

// 정적 파일 제공
app.use('/*', serveStatic({ root: './static' }));

// 루트 경로를 index.html로 명시적으로 매핑
app.get('/', serveStatic({ path: './static/index.html' }));

// 인증 라우트 (JWT 불필요)
app.route('/api/auth', authRoutes);

// 보호된 라우트 (JWT 필요)
app.use('/api/diary/*', authMiddleware);
app.use('/api/phrases/*', authMiddleware);

// API 라우트
app.route('/api/diary', diaryRoutes);
app.route('/api/phrases', phraseRoutes);

// Health check
app.get('/api/health', (c) => {
  return c.json({
    status: 'healthy',
    scheduler: 'running',
    timestamp: new Date().toISOString()
  });
});

// 수동 트리거
app.post('/api/trigger-now', async (c) => {
  const { processAndSendLetters } = await import('./services/scheduler.js');
  await processAndSendLetters();
  return c.json({
    success: true,
    message: 'Letter processing triggered manually'
  });
});

// Scheduler 시작
startScheduler();

const port = Number(process.env.PORT) || 3000;

console.log(`🚀 Server is running on http://localhost:${port}`);

serve({
  fetch: app.fetch,
  port
});
