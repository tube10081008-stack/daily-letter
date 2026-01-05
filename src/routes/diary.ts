import { Hono } from 'hono';
import { verify } from 'hono/jwt';
import { db } from '../utils/db.js';

const app = new Hono();

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// JWT 인증 미들웨어
async function authMiddleware(c: any, next: any) {
  try {
    const authHeader = c.req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return c.json({ error: 'Unauthorized - No token provided' }, 401);
    }

    const token = authHeader.substring(7);
    const payload = await verify(token, JWT_SECRET) as any;
    
    // 요청 객체에 userId 추가
    c.set('userId', payload.userId);
    await next();
  } catch (error) {
    return c.json({ error: 'Unauthorized - Invalid token' }, 401);
  }
}

// 일기 작성
app.post('/', authMiddleware, async (c) => {
  try {
    const userId = c.get('userId');
    const { content, mood } = await c.req.json();

    if (!content) {
      return c.json({ error: 'Content is required' }, 400);
    }

    const entry = db.createDiaryEntry({
      user_id: userId,
      content,
      mood
    });

    return c.json({
      success: true,
      message: 'Diary saved successfully',
      diaryId: entry.id
    });

  } catch (error) {
    console.error('Diary save error:', error);
    return c.json({ error: 'Failed to save diary' }, 500);
  }
});

// 최근 일기 조회
app.get('/recent', authMiddleware, async (c) => {
  try {
    const userId = c.get('userId');
    const limit = parseInt(c.req.query('limit') || '10');

    const entries = db.getRecentDiaries(userId, limit);

    return c.json({
      success: true,
      entries
    });

  } catch (error) {
    console.error('Diary fetch error:', error);
    return c.json({ error: 'Failed to fetch diaries' }, 500);
  }
});

export default app;
