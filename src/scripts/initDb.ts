import { db } from '../utils/db.js';

console.log('🔧 Initializing database with test data...\n');

try {
  // 테스트 사용자 생성
  console.log('👤 Creating test user...');
  const testUser = db.createUser({
    email: 'test@example.com',
    timezone: 'Asia/Seoul'
  });
  console.log(`✅ User created: ${testUser.email} (ID: ${testUser.id})\n`);

  // 테스트 일기 추가
  console.log('📝 Adding test diary entries...');
  db.getDB().prepare(`
    INSERT INTO diary_entries (user_id, content, mood, created_at)
    VALUES (?, ?, ?, datetime('now', '-1 day'))
  `).run(
    testUser.id,
    '오늘은 새로운 프로젝트를 시작했다. AI가 일기를 읽고 편지를 써준다니 신기하다. 앞으로 어떤 편지를 받게 될지 기대된다.',
    '기대됨'
  );
  console.log('✅ Diary entry added\n');

  // 테스트 명언 추가
  console.log('💭 Adding favorite phrases...');
  db.getDB().prepare(`
    INSERT INTO favorite_phrases (user_id, content, author)
    VALUES (?, ?, ?)
  `).run(
    testUser.id,
    '행복은 습관이다. 그것을 몸에 지니라.',
    '허버트'
  );

  db.getDB().prepare(`
    INSERT INTO favorite_phrases (user_id, content, author)
    VALUES (?, ?, ?)
  `).run(
    testUser.id,
    '성공은 매일 반복한 작은 노력들의 합이다.',
    '로버트 콜리어'
  );

  console.log('✅ Phrases added\n');

  console.log('🎉 Database initialization complete!');
  console.log('\n📊 Summary:');
  console.log(`   - User: ${testUser.email}`);
  console.log(`   - Diary entries: 1`);
  console.log(`   - Favorite phrases: 2`);

  db.close();

} catch (error) {
  console.error('❌ Database initialization failed:', error);
  process.exit(1);
}
