import { Hono } from 'hono';
import { verify } from 'hono/jwt';
import { db } from '../utils/db.js';

// Hono 앱 타입 정의
type Variables = {
  userId: number;
};

const app = new Hono<{ Variables: Variables }>();

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// JWT 인증 미들웨어
app.use('*', async (c, next) => {
  try {
    const authHeader = c.req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return c.json({ error: 'Unauthorized - No token provided' }, 401);
    }

    const token = authHeader.substring(7);
    const payload = await verify(token, JWT_SECRET) as any;
    
    // 🔍 디버깅: 사용자 존재 확인
    const user = db.getUserById(payload.userId);
    if (!user) {
      console.error(`❌ User not found in DB: userId=${payload.userId}`);
      return c.json({ error: 'User not found - Please sign up again' }, 404);
    }
    
    console.log(`✅ User found: ${user.username} (ID: ${user.id})`);
    
    // 요청 객체에 userId 추가
    c.set('userId', payload.userId);
    await next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return c.json({ error: 'Unauthorized - Invalid token' }, 401);
  }
});

// 일기 작성
app.post('/', async (c) => {
  try {
    const userId = c.get('userId');
    const { content, mood } = await c.req.json();

    console.log(`📝 Saving diary for userId: ${userId}`);

    if (!content) {
      return c.json({ error: 'Content is required' }, 400);
    }

    const entry = db.createDiaryEntry({
      user_id: userId,
      content,
      mood
    });

    console.log(`✅ Diary saved successfully: ID ${entry.id}`);

    return c.json({
      success: true,
      message: 'Diary saved successfully',
      diaryId: entry.id
    });

  } catch (error: any) {
    console.error('❌ Diary save error:', error);
    
    if (error.code === 'SQLITE_CONSTRAINT_FOREIGNKEY') {
      return c.json({ 
        error: 'User not found in database. Please log out and sign up again.' 
      }, 400);
    }
    
    return c.json({ error: 'Failed to save diary' }, 500);
  }
});

// 최근 일기 조회
app.get('/recent', async (c) => {
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
