/**
 * Neon Database Connection Helper
 */

const { neon } = require('@neondatabase/serverless');

/**
 * Get database connection
 * @returns {Function} SQL query function
 */
function getDb() {
  const connectionString = process.env.NEON_DATABASE_URL || process.env.DATABASE_URL;
  
  if (!connectionString) {
    throw new Error('Database connection string not found in environment variables');
  }
  
  return neon(connectionString);
}

/**
 * Execute SQL query with error handling
 * @param {string} query - SQL query
 * @param {Array} params - Query parameters
 * @returns {Promise<Array>} Query results
 */
async function query(query, params = []) {
  try {
    const sql = getDb();
    const result = await sql(query, params);
    return result;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

/**
 * Get current timestamp in ISO 8601 format
 * @returns {string} ISO timestamp
 */
function now() {
  return new Date().toISOString();
}

module.exports = {
  getDb,
  query,
  now
};
