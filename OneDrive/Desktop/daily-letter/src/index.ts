import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { serveStatic } from '@hono/node-server/serve-static';
import { cors } from 'hono/cors';
import { config } from 'dotenv';
import diary from './routes/diary.js';
import phrases from './routes/phrases.js';
import { startScheduler, processAndSendLetters } from './services/scheduler.js';
import { testMailerConnection } from './services/mailer.js';

config();

const app = new Hono();

// Middleware
app.use('/*', cors());

// Serve static files
app.use('/static/*', serveStatic({ root: './' }));
app.use('/', serveStatic({ path: './static/index.html' }));

// API Routes
app.route('/api/diary', diary);
app.route('/api/phrases', phrases);

// Health check
app.get('/api/health', (c) => {
  return c.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    scheduler: 'running'
  });
});

// Manual trigger for testing
app.post('/api/trigger-now', async (c) => {
  try {
    await processAndSendLetters();
    return c.json({ success: true, message: 'Letter processing triggered manually' });
  } catch (error) {
    console.error('Manual trigger error:', error);
    return c.json({ error: 'Failed to trigger letter processing' }, 500);
  }
});

// Start server
const port = parseInt(process.env.PORT || '3000');

console.log('🚀 Starting Daily Condition Letter System...\n');

// Test email connection
testMailerConnection().then((connected) => {
  if (!connected) {
    console.warn('⚠️  Warning: Gmail connection not verified. Check your .env credentials.\n');
  }
});

// Start scheduler
startScheduler();

serve({
  fetch: app.fetch,
  port
});

console.log(`\n✅ Server is running on http://localhost:${port}`);
console.log(`📊 Health check: http://localhost:${port}/api/health`);
console.log(`🧪 Manual trigger: POST http://localhost:${port}/api/trigger-now\n`);