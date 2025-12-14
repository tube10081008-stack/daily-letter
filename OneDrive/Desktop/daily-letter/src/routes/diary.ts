import { Hono } from 'hono';
import { db } from '../utils/db.js';

const diary = new Hono();

// Save diary entry
diary.post('/', async (c) => {
  try {
    const { content, mood } = await c.req.json();
    const userId = 1; // Demo user ID

    if (!content || content.trim().length === 0) {
      return c.json({ error: 'Diary content is required' }, 400);
    }

    const stmt = db.prepare(
      'INSERT INTO diary_entries (user_id, content, mood) VALUES (?, ?, ?)'
    );
    const result = stmt.run(userId, content.trim(), mood || null);

    return c.json({
      success: true,
      message: 'Diary saved successfully! Letter will be sent tomorrow at 7 AM.',
      diaryId: result.lastInsertRowid
    }, 201);
  } catch (error) {
    console.error('Error saving diary:', error);
    return c.json({ error: 'Failed to save diary' }, 500);
  }
});

// Get recent diary entries
diary.get('/recent', (c) => {
  try {
    const userId = 1; // Demo user ID
    const limit = parseInt(c.req.query('limit') || '5');

    const stmt = db.prepare(`
      SELECT id, content, mood, created_at, sent_at
      FROM diary_entries
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT ?
    `);

    const entries = stmt.all(userId, limit);
    return c.json({ entries });
  } catch (error) {
    console.error('Error fetching diary entries:', error);
    return c.json({ error: 'Failed to fetch diary entries' }, 500);
  }
});

export default diary;