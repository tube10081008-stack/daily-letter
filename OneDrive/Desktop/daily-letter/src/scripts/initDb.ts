import { exec, prepare } from '../utils/db.js';
import { existsSync, mkdirSync } from 'fs';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dataDir = join(__dirname, '../../data');

// Ensure data directory exists
if (!existsSync(dataDir)) {
  mkdirSync(dataDir, { recursive: true });
  console.log('✅ Created data directory');
}

// Create tables (simulated)
const createTables = () => {
  exec('CREATE TABLE IF NOT EXISTS users');
  exec('CREATE TABLE IF NOT EXISTS diary_entries');
  exec('CREATE TABLE IF NOT EXISTS favorite_phrases');
  console.log('✅ Database tables created successfully');
};

// Insert demo data
const insertDemoData = () => {
  const existingUser = prepare('SELECT id FROM users WHERE email = ?').get('demo@example.com');
  
  if (!existingUser) {
    const insertUser = prepare('INSERT INTO users (email, name) VALUES (?, ?)');
    const result = insertUser.run('demo@example.com', 'Demo User');
    console.log(`✅ Demo user created (ID: ${result.lastInsertRowid})`);

    const insertPhrase = prepare('INSERT INTO favorite_phrases (user_id, content, author) VALUES (?, ?, ?)');
    insertPhrase.run(result.lastInsertRowid, '살아있는 것은 아름답다. 그것이 무엇이든.', '백석');
    insertPhrase.run(result.lastInsertRowid, '나는 매일 새로운 사람이 되고 싶다.', '윤동주');
    console.log('✅ Sample favorite phrases added');
  } else {
    console.log('ℹ️  Demo user already exists');
  }
};

try {
  createTables();
  insertDemoData();
  console.log('\n🎉 Database initialization complete!');
  console.log(`📁 Database location: ${join(dataDir, 'database.json')}`);
  process.exit(0);
} catch (error) {
  console.error('❌ Database initialization failed:', error);
  process.exit(1);
}