import { Hono } from 'hono';
import { db } from '../utils/db.js';

const phrases = new Hono();

// 모든 명언 조회
phrases.get('/', async (c) => {
  try {
    const user = c.get('user');
    const userId = user?.userId || 1;

    const allPhrases = db.prepare(
      'SELECT * FROM favorite_phrases WHERE user_id = ?'
    ).all(userId);

    return c.json({ success: true, phrases: allPhrases });
  } catch (error) {
    console.error('❌ Error fetching phrases:', error);
    return c.json({ error: 'Failed to fetch phrases' }, 500);
  }
});

// 명언 추가
phrases.post('/', async (c) => {
  try {
    const user = c.get('user');
    const userId = user?.userId || 1;

    const { content, author } = await c.req.json();

    if (!content) {
      return c.json({ error: 'Content is required' }, 400);
    }

    const result = db.prepare(
      'INSERT INTO favorite_phrases (user_id, content, author) VALUES (?, ?, ?)'
    ).run(userId, content, author || null);

    return c.json({
      success: true,
      message: 'Phrase added successfully',
      phraseId: result.lastInsertRowid
    });
  } catch (error) {
    console.error('❌ Error adding phrase:', error);
    return c.json({ error: 'Failed to add phrase' }, 500);
  }
});

// 명언 삭제
phrases.delete('/:id', async (c) => {
  try {
    const id = Number(c.req.param('id'));

    db.prepare('DELETE FROM favorite_phrases WHERE id = ?').run(id);

    return c.json({
      success: true,
      message: 'Phrase deleted successfully'
    });
  } catch (error) {
    console.error('❌ Error deleting phrase:', error);
    return c.json({ error: 'Failed to delete phrase' }, 500);
  }
});

export default phrases;