import { Hono } from 'hono';
import { db } from '../utils/db.js';

const phrases = new Hono();

// Get all favorite phrases
phrases.get('/', (c) => {
  try {
    const userId = 1; // Demo user ID

    const stmt = db.prepare(`
      SELECT id, content, author, created_at
      FROM favorite_phrases
      WHERE user_id = ?
      ORDER BY created_at DESC
    `);

    const allPhrases = stmt.all(userId);
    return c.json({ phrases: allPhrases });
  } catch (error) {
    console.error('Error fetching phrases:', error);
    return c.json({ error: 'Failed to fetch phrases' }, 500);
  }
});

// Add new favorite phrase
phrases.post('/', async (c) => {
  try {
    const { content, author } = await c.req.json();
    const userId = 1; // Demo user ID

    if (!content || content.trim().length === 0) {
      return c.json({ error: 'Phrase content is required' }, 400);
    }

    const stmt = db.prepare(
      'INSERT INTO favorite_phrases (user_id, content, author) VALUES (?, ?, ?)'
    );
    const result = stmt.run(userId, content.trim(), author?.trim() || null);

    return c.json({
      success: true,
      message: 'Favorite phrase added successfully!',
      phraseId: result.lastInsertRowid
    }, 201);
  } catch (error) {
    console.error('Error adding phrase:', error);
    return c.json({ error: 'Failed to add phrase' }, 500);
  }
});

// Delete favorite phrase
phrases.delete('/:id', (c) => {
  try {
    const phraseId = parseInt(c.req.param('id'));
    const userId = 1; // Demo user ID

    const stmt = db.prepare('DELETE FROM favorite_phrases WHERE id = ? AND user_id = ?');
    const result = stmt.run(phraseId, userId);

    if (result.changes === 0) {
      return c.json({ error: 'Phrase not found' }, 404);
    }

    return c.json({ success: true, message: 'Phrase deleted successfully' });
  } catch (error) {
    console.error('Error deleting phrase:', error);
    return c.json({ error: 'Failed to delete phrase' }, 500);
  }
});

export default phrases;