import { Hono } from 'hono';
import { db } from '../utils/db.js';

const diary = new Hono();

// 일기 저장
diary.post('/', async (c) => {
  try {
    const user = c.get('user');
    const userId = user?.userId || 1;

    const { content, mood } = await c.req.json();

    if (!content) {
      return c.json({ error: 'Content is required' }, 400);
    }

    const result = db.prepare(
      'INSERT INTO diary_entries (user_id, content, mood) VALUES (?, ?, ?)'
    ).run(userId, content, mood || null);

    return c.json({
      success: true,
      message: 'Diary saved successfully',
      diaryId: result.lastInsertRowid,
      scheduledFor: '내일 오전 7시'
    });
  } catch (error) {
    console.error('❌ Error saving diary:', error);
    return c.json({ error: 'Failed to save diary' }, 500);
  }
});

// 최근 일기 조회
diary.get('/recent', async (c) => {
  try {
    const user = c.get('user');
    const userId = user?.userId || 1;

    const limit = Number(c.req.query('limit')) || 10;

    const entries = db.prepare(
      'SELECT * FROM diary_entries WHERE user_id = ? ORDER BY created_at DESC LIMIT ?'
    ).all(userId, limit);

    return c.json({ success: true, entries });
  } catch (error) {
    console.error('❌ Error fetching diaries:', error);
    return c.json({ error: 'Failed to fetch diaries' }, 500);
  }
});

export default diary;