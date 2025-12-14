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
// Auto-initialize database with demo data on startup
import { prepare, exec } from './utils/db.js';

async function ensureDemoData() {
  try {
    // Check if demo user exists
    const existingUser = prepare('SELECT id FROM users WHERE email = ?').get('demo@example.com');
    
    if (!existingUser) {
      console.log('🔧 Initializing database with demo data...');
      
      // Create tables (in case they don't exist)
      exec('CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, email TEXT NOT NULL UNIQUE, name TEXT NOT NULL, created_at TEXT DEFAULT (datetime("now", "localtime")))');
      exec('CREATE TABLE IF NOT EXISTS diary_entries (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL, content TEXT NOT NULL, mood TEXT, created_at TEXT DEFAULT (datetime("now", "localtime")), sent_at TEXT, FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE)');
      exec('CREATE TABLE IF NOT EXISTS favorite_phrases (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL, content TEXT NOT NULL, author TEXT, created_at TEXT DEFAULT (datetime("now", "localtime")), FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE)');
      
      // Insert demo user
      const insertUser = prepare('INSERT INTO users (email, name) VALUES (?, ?)');
      const result = insertUser.run('demo@example.com', 'Demo User');
      
      // Insert sample favorite phrases
      const insertPhrase = prepare('INSERT INTO favorite_phrases (user_id, content, author) VALUES (?, ?, ?)');
      insertPhrase.run(result.lastInsertRowid, '살아있는 것은 아름답다. 그것이 무엇이든.', '백석');
      insertPhrase.run(result.lastInsertRowid, '나는 매일 새로운 사람이 되고 싶다.', '윤동주');
      insertPhrase.run(result.lastInsertRowid, '천천히, 그러나 멈추지 않고', '괴테');
      
      console.log('✅ Demo data initialized successfully!');
    } else {
      console.log('✅ Demo data already exists');
    }
  } catch (error) {
    console.error('⚠️  Error initializing demo data:', error);
  }
}

// Run initialization
await ensureDemoData();

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