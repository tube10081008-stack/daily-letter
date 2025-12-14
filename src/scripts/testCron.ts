import { config } from 'dotenv';
import { db } from '../utils/db.js';

config();

console.log('🧪 Daily Condition Letter - Prerequisites Check\n');

// Check environment variables
console.log('📝 Environment Variables:');
console.log(`   GEMINI_API_KEY: ${process.env.GEMINI_API_KEY ? '✅ SET' : '❌ NOT SET'}`);
console.log(`   GMAIL_USER: ${process.env.GMAIL_USER ? '✅ SET' : '❌ NOT SET'}`);
console.log(`   GMAIL_APP_PASSWORD: ${process.env.GMAIL_APP_PASSWORD ? '✅ SET' : '❌ NOT SET'}`);
console.log(`   PORT: ${process.env.PORT || '3000'}\n`);

// Check database
console.log('💾 Database Check:');
const user = db.prepare('SELECT * FROM users WHERE id = 1').get();
console.log(`   Demo user exists: ${user ? '✅ YES' : '❌ NO'}`);

if (user) {
  const phrasesCount = db.prepare('SELECT COUNT(*) as count FROM favorite_phrases WHERE user_id = 1').get() as { count: number };
  const diariesCount = db.prepare('SELECT COUNT(*) as count FROM diary_entries WHERE user_id = 1 AND DATE(created_at) = DATE("now", "-1 day")').get() as { count: number };
  
  console.log(`   Favorite phrases: ${phrasesCount.count}`);
  console.log(`   Recent diaries: ${diariesCount.count}\n`);
}

// Instructions
console.log('📋 Test Instructions:');
console.log('1. Ensure you have at least one diary entry and one favorite phrase');
console.log('2. Configure .env with actual credentials:');
console.log('   - GEMINI_API_KEY=your-gemini-api-key');
console.log('   - GMAIL_USER=your-email@gmail.com');
console.log('   - GMAIL_APP_PASSWORD=your-16-char-app-password\n');
console.log('3. Start the server: npm run dev');
console.log('4. Test immediately: curl -X POST http://localhost:3000/api/trigger-now');
console.log('5. Or wait for scheduled run: Daily at 7:00 AM (Asia/Seoul)\n');