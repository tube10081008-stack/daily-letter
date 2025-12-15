import { db } from '../utils/db.js';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';

const dataDir = join(process.cwd(), 'data');

// 데이터 디렉토리 생성
if (!existsSync(dataDir)) {
  mkdirSync(dataDir, { recursive: true });
  console.log('📁 Created data directory');
}

console.log('🔧 Initializing database...');

// 데모 사용자 생성
try {
  db.prepare('INSERT INTO users (email, name, username, password_hash) VALUES (?, ?, ?, ?)').run(
    'demo@example.com',
    '성현',
    null,
    null
  );
  console.log('✅ Demo user created');
} catch (error) {
  console.log('ℹ️  Demo user already exists');
}

// 샘플 명언 추가
try {
  db.prepare('INSERT INTO favorite_phrases (user_id, content, author) VALUES (?, ?, ?)').run(
    1,
    '삶이 있는 한 희망은 있다.',
    '키케로'
  );

  db.prepare('INSERT INTO favorite_phrases (user_id, content, author) VALUES (?, ?, ?)').run(
    1,
    '산다는것 그것은 치열한 전투이다.',
    '로망로랑'
  );
  
  console.log('✅ Sample phrases created');
} catch (error) {
  console.log('ℹ️  Sample phrases already exist');
}

console.log('✅ Database initialization complete!');