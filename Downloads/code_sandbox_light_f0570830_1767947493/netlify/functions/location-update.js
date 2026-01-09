/**
 * PATCH /.netlify/functions/location-update
 * 
 * Body: { locationId, entry_instruction_text }
 * Returns: { success: true, location: {...} }
 */

const { query } = require('./lib/db');

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'PATCH, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'PATCH') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { locationId, entry_instruction_text } = JSON.parse(event.body);

    if (!locationId || !entry_instruction_text) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing required fields: locationId, entry_instruction_text' })
      };
    }

    // Update location
    const result = await query(
      `UPDATE locations 
       SET entry_instruction_text = $1
       WHERE id = $2
       RETURNING *`,
      [entry_instruction_text, locationId]
    );

    if (result.length === 0) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'Location not found' })
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        location: result[0]
      })
    };

  } catch (error) {
    console.error('Location update error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error', message: error.message })
    };
  }
};
