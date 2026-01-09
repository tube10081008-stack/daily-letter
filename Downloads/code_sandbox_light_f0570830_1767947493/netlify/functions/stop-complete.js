/**
 * POST /.netlify/functions/stop-complete
 * 
 * Body: { stopId, deliveredType: 'DELIVERED' | 'COLLECTED' | 'BOTH', note? }
 * Returns: { success: true, stop: {...} }
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
    const { stopId, deliveredType, note, userId } = JSON.parse(event.body);

    if (!stopId || !deliveredType) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing required fields: stopId, deliveredType' })
      };
    }

    const validTypes = ['DELIVERED', 'COLLECTED', 'BOTH'];
    if (!validTypes.includes(deliveredType)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid deliveredType. Must be DELIVERED, COLLECTED, or BOTH' })
      };
    }

    const completedAt = now();

    // Update stop status
    const stopResult = await query(
      `UPDATE stops 
       SET status = 'COMPLETED', 
           completed_at = $1, 
           delivered_type = $2
       WHERE id = $3
       RETURNING *`,
      [completedAt, deliveredType, stopId]
    );

    if (stopResult.length === 0) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'Stop not found' })
      };
    }

    const stop = stopResult[0];

    // If note provided, create stop event
    if (note) {
      const eventId = `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      await query(
        `INSERT INTO stop_events (id, stop_id, type, content, created_at, created_by)
         VALUES ($1, $2, 'NOTE', $3, $4, $5)`,
        [eventId, stopId, note, now(), userId || 'unknown']
      );
    }

    // Create system event
    const systemEventId = `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const deliveryLabel = {
      'DELIVERED': '배송완료',
      'COLLECTED': '회수완료',
      'BOTH': '배송+회수'
    }[deliveredType];
    
    await query(
      `INSERT INTO stop_events (id, stop_id, type, content, created_at, created_by)
       VALUES ($1, $2, 'SYSTEM', $3, $4, $5)`,
      [systemEventId, stopId, `정차지 완료: ${deliveryLabel}`, now(), userId || 'system']
    );

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        stop: stop
      })
    };

  } catch (error) {
    console.error('Stop complete error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error', message: error.message })
    };
  }
};
