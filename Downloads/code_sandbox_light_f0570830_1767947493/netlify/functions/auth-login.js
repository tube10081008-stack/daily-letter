/**
 * POST /.netlify/functions/auth-login
 * 
 * Body: { role: 'ADMIN' | 'DRIVER', id, pin }
 * Returns: { success: true, user: {...}, token: '...' }
 */

const { query } = require('./lib/db');

exports.handler = async (event) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  // Only POST allowed
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { role, id, pin } = JSON.parse(event.body);

    // Validate input
    if (!role || !id || !pin) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing required fields: role, id, pin' })
      };
    }

    if (role !== 'ADMIN' && role !== 'DRIVER') {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid role. Must be ADMIN or DRIVER' })
      };
    }

    let user = null;
    let table = role === 'ADMIN' ? 'admins' : 'drivers';

    // Query database
    const result = await query(
      `SELECT * FROM ${table} WHERE id = $1 AND pin_hash = $2`,
      [id, pin]
    );

    if (result.length === 0) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'Invalid credentials' })
      };
    }

    user = result[0];

    // Generate simple token (in production, use JWT)
    const token = Buffer.from(`${role}:${id}:${Date.now()}`).toString('base64');

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        user: {
          id: user.id,
          name: user.name,
          role: role
        },
        token: token
      })
    };

  } catch (error) {
    console.error('Auth error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error', message: error.message })
    };
  }
};
