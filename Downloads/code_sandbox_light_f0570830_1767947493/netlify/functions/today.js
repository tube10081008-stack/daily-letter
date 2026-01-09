/**
 * GET /.netlify/functions/today?date=YYYY-MM-DD&driverId=xxx
 * 
 * Returns: { routeDay: {...}, stops: [{...location info...}] }
 */

const { query } = require('./lib/db');

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { date, driverId } = event.queryStringParameters || {};

    if (!date || !driverId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing required parameters: date, driverId' })
      };
    }

    // Get route day for driver
    const routeDayResult = await query(
      `SELECT * FROM route_days WHERE date = $1 AND driver_id = $2`,
      [date, driverId]
    );

    if (routeDayResult.length === 0) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'No route found for this driver on this date' })
      };
    }

    const routeDay = routeDayResult[0];

    // Get stops with location info (JOIN)
    const stopsResult = await query(
      `SELECT 
        s.id,
        s.route_day_id,
        s.sequence,
        s.location_id,
        s.planned_cs,
        s.planned_bt,
        s.planned_ft,
        s.status,
        s.job_started_at,
        s.completed_at,
        s.delivered_type,
        s.created_at,
        l.name as location_name,
        l.address as location_address,
        l.region as location_region,
        l.entry_instruction_text
      FROM stops s
      JOIN locations l ON s.location_id = l.id
      WHERE s.route_day_id = $1
      ORDER BY s.sequence ASC`,
      [routeDay.id]
    );

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        routeDay: routeDay,
        stops: stopsResult
      })
    };

  } catch (error) {
    console.error('Today query error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error', message: error.message })
    };
  }
};
