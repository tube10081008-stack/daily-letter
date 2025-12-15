import cron from 'node-cron';
import { db } from '../utils/db.js';
import type { User, DiaryEntry, FavoritePhrase } from '../utils/db.js';
import { generateLetter } from './gemini.js';
import { sendEmail } from './mailer.js';
import { generateEmailHTML } from '../templates/email.js';

// 매일 오전 7시 (한국 시간) 실행
export function startScheduler() {
  console.log('📅 Scheduler initialized - Daily letters at 7:00 AM KST');

  // 테스트: 매분마다 실행 (개발용)
  // cron.schedule('* * * * *', async () => {
  //   console.log('⏰ Running scheduled task (every minute for testing)...');
  //   await processAndSendLetters();
  // });

  // 프로덕션: 매일 오전 7시 실행
  cron.schedule('0 7 * * *', async () => {
    console.log('⏰ Running scheduled task at 7:00 AM KST...');
    await processAndSendLetters();
  }, {
    timezone: 'Asia/Seoul'
  });
}

// 일기 처리 및 이메일 발송
export async function processAndSendLetters() {
  console.log('🔔 Starting daily letter processing...');

  try {
    // 미발송 일기 조회
    const pendingDiaries = db.prepare(
      'SELECT * FROM diary_entries WHERE sent_at IS NULL'
    ).all() as DiaryEntry[];

    console.log(`📝 Found ${pendingDiaries.length} diary entries to process`);

    for (const diary of pendingDiaries) {
      // 사용자 정보 조회
      const userInfo = db.prepare('SELECT * FROM users WHERE id = ?').get(diary.user_id) as User;

      if (!userInfo) {
        console.log(`⚠️ User not found for diary ${diary.id}`);
        continue;
      }

      console.log(`🎯 Processing diary for user: ${userInfo.name}`);

      // 사용자의 명언 조회
      const phrases = db.prepare(
        'SELECT * FROM favorite_phrases WHERE user_id = ?'
      ).all(diary.user_id) as FavoritePhrase[];

      // 편지 전송
      await sendDailyLetter(userInfo, diary, phrases);

      // 발송 완료 표시
      db.prepare('UPDATE diary_entries SET sent_at = ? WHERE id = ?')
        .run(new Date().toISOString(), diary.id);

      console.log(`✅ Letter sent successfully to ${userInfo.email}`);
    }

    console.log('🎉 Daily letter processing complete!');
  } catch (error) {
    console.error('❌ Error in processAndSendLetters:', error);
  }
}

// 개별 이메일 발송
async function sendDailyLetter(
  user: User,
  diary: DiaryEntry,
  phrases: FavoritePhrase[]
) {
  try {
    // AI 편지 생성
    const letterContent = await generateLetter(user, diary, phrases);
    console.log('✅ Letter generated successfully');

    // HTML 이메일 생성
    const emailHTML = generateEmailHTML(user.name, letterContent);

    // 이메일 발송 (객체 형태로 전달)
    await sendEmail({
      to: user.email,
      subject: `${new Date().toLocaleDateString('ko-KR', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        weekday: 'long'
      })} - 오늘의 편지가 도착했습니다 💌`,
      html: emailHTML
    });

    console.log(`📧 Email sent successfully to ${user.email}`);
  } catch (error) {
    console.error(`❌ Failed to send letter to ${user.email}:`, error);
    throw error;
  }
}