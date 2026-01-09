/**
 * POST /.netlify/functions/stop-note
 * 
 * Body: { stopId, content, userId? }
 * Returns: { success: true, event: {...} }
 */

const { query, now } = require('./lib/db');

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { stopId, content, userId } = JSON.parse(event.body);

    if (!stopId || !content) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing required fields: stopId, content' })
      };
    }

    // Create stop event
    const eventId = `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const result = await query(
      `INSERT INTO stop_events (id, stop_id, type, content, created_at, created_by)
       VALUES ($1, $2, 'NOTE', $3, $4, $5)
       RETURNING *`,
      [eventId, stopId, content, now(), userId || 'unknown']
    );

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        event: result[0]
      })
    };

  } catch (error) {
    console.error('Stop note error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error', message: error.message })
    };
  }
};
