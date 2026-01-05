import { SchedulerService } from '../services/scheduler.js';
import { db } from '../utils/db.js';

console.log('🧪 Testing cron scheduler...\n');

async function testScheduler() {
  try {
    // 사용자 조회
    const user = db.getDB().prepare('SELECT * FROM users LIMIT 1').get() as any;
    
    if (!user) {
      // 테스트 사용자 조회
      const testDiary = db.getDB().prepare('SELECT * FROM diary_entries LIMIT 1').get() as any;
      
      if (!testDiary) {
        const testPhrase = db.getDB().prepare('SELECT * FROM favorite_phrases LIMIT 1').get() as any;
        
        console.log('⚠️  No data found. Run: npm run db:init');
        return;
      }
    }

    console.log(`✅ Found user: ${user.email}\n`);

    // 스케줄러 생성 및 수동 트리거
    const scheduler = new SchedulerService();
    
    console.log('🚀 Triggering manual letter generation...\n');
    await scheduler.triggerNow();

    console.log('\n✅ Test completed successfully!');
    
    db.close();

  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

testScheduler();
