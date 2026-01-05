import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';
import { config } from 'dotenv';
import diary from './routes/diary.js';
import phrases from './routes/phrases.js';
import auth from './routes/auth.js';
import { SchedulerService } from './services/scheduler.js';

// Load environment variables
config();

const app = new Hono();
let scheduler: SchedulerService;

// Middleware - CORS
app.use('*', async (c, next) => {
  c.header('Access-Control-Allow-Origin', '*');
  c.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  c.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (c.req.method === 'OPTIONS') {
    return c.body(null, 204);
  }
  
  await next();
});

// Routes
app.get('/', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="ko">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Daily Condition Letter</title>
      <script src="https://cdn.tailwindcss.com"></script>
    </head>
    <body class="bg-gradient-to-br from-purple-50 to-blue-50 min-h-screen">
      <div id="app"></div>
      <script src="/static/app.js"></script>
    </body>
    </html>
  `);
});

// API routes
app.route('/api/auth', auth);
app.route('/api/diary', diary);
app.route('/api/phrases', phrases);

// Manual trigger endpoint (for testing)
app.post('/api/trigger-now', async (c) => {
  try {
    if (scheduler) {
      await scheduler.triggerNow();
      return c.json({ success: true, message: 'Letter generation triggered' });
    } else {
      return c.json({ error: 'Scheduler not initialized' }, 500);
    }
  } catch (error) {
    console.error('Trigger error:', error);
    return c.json({ error: 'Failed to trigger letter generation' }, 500);
  }
});

// Health check
app.get('/api/health', (c) => {
  return c.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    scheduler: scheduler ? 'running' : 'not initialized'
  });
});

// Static files
app.use('/static/*', serveStatic({ root: './' }));

// Initialize scheduler
function initializeScheduler() {
  try {
    scheduler = new SchedulerService();
    scheduler.startScheduler();
  } catch (error) {
    console.error('❌ Failed to initialize scheduler:', error);
    console.log('⚠️  Server will run without scheduler');
  }
}

// Start server
const port = parseInt(process.env.PORT || '3000');

console.log(`
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║           Daily Condition Letter System                     ║
║           AI-Powered Morning Newsletter                     ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
`);

serve({
  fetch: app.fetch,
  port
}, (info) => {
  console.log(`🚀 Server running at http://localhost:${info.port}`);
  console.log(`📊 Health check: http://localhost:${info.port}/api/health`);
  console.log(`🔧 Manual trigger: POST http://localhost:${info.port}/api/trigger-now\n`);
  
  // Start scheduler after server is running
  initializeScheduler();
});

export default app;
