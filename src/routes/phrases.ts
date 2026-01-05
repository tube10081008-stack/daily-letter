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

// 명언 추가
app.post('/', async (c) => {
  try {
    const userId = c.get('userId');
    const { content, author } = await c.req.json();

    console.log(`📝 Adding phrase for userId: ${userId}`);
    console.log(`📝 Content: ${content}`);
    console.log(`📝 Author: ${author}`);

    if (!content) {
      return c.json({ error: 'Content is required' }, 400);
    }

    const phrase = db.addFavoritePhrase({
      user_id: userId,
      content,
      author
    });

    console.log(`✅ Phrase added successfully: ID ${phrase.id}`);

    return c.json({
      success: true,
      message: 'Phrase added successfully',
      phraseId: phrase.id
    });

  } catch (error: any) {
    console.error('❌ Phrase add error:', error);
    
    if (error.code === 'SQLITE_CONSTRAINT_FOREIGNKEY') {
      return c.json({ 
        error: 'User not found in database. Please log out and sign up again.' 
      }, 400);
    }
    
    return c.json({ error: 'Failed to add phrase' }, 500);
  }
});

// 명언 목록 조회
app.get('/', async (c) => {
  try {
    const userId = c.get('userId');
    const phrases = db.getAllPhrases(userId);

    return c.json({
      success: true,
      phrases
    });

  } catch (error) {
    console.error('Phrases fetch error:', error);
    return c.json({ error: 'Failed to fetch phrases' }, 500);
  }
});

// 명언 삭제
app.delete('/:id', async (c) => {
  try {
    const userId = c.get('userId');
    const phraseId = parseInt(c.req.param('id'));

    const deleted = db.deletePhrase(phraseId, userId);

    if (!deleted) {
      return c.json({ error: 'Phrase not found' }, 404);
    }

    return c.json({
      success: true,
      message: 'Phrase deleted successfully'
    });

  } catch (error) {
    console.error('Phrase delete error:', error);
    return c.json({ error: 'Failed to delete phrase' }, 500);
  }
});

export default app;
