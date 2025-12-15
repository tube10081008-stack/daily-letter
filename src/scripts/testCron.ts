import dotenv from 'dotenv';
import { db } from '../utils/db.js';

dotenv.config();

console.log('🧪 Testing Cron Job Prerequisites...\n');

// 1. Database 확인
console.log('1️⃣ Checking Database...');
const users = db.prepare('SELECT * FROM users WHERE email = ?').get('demo@example.com') as any;
console.log('   Users:', users ? 'Found demo user' : 'No demo user');

const diaries = db.prepare('SELECT * FROM diary_entries WHERE sent_at IS NULL').all();
console.log('   Unsent diaries:', diaries.length);

const phrases = db.prepare('SELECT * FROM favorite_phrases').all();
console.log('   Phrases:', phrases.length);

// 2. Environment Variables 확인
console.log('\n2️⃣ Checking Environment Variables...');
console.log('   SENDGRID_API_KEY:', process.env.SENDGRID_API_KEY ? '✅ Set' : '❌ Missing');
console.log('   SENDGRID_FROM_EMAIL:', process.env.SENDGRID_FROM_EMAIL || '❌ Missing');
console.log('   GEMINI_API_KEY:', process.env.GEMINI_API_KEY ? '✅ Set' : '❌ Missing');

// 3. Scheduler 테스트
console.log('\n3️⃣ Testing Scheduler Logic...');
if (diaries.length > 0) {
  console.log('   ✅ Ready to send', diaries.length, 'letters');
} else {
  console.log('   ℹ️  No unsent diaries found');
}

console.log('\n✅ Test complete!');