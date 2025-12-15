import cron from 'node-cron';
import { db } from '../utils/db.js';
import { sendDailyLetter } from './mailer.js';
import { generateLetter } from './gemini.js';

let isProcessing = false;

export async function processAndSendLetters() {
  if (isProcessing) {
    console.log('⏳ Letter processing already in progress, skipping...');
    return;
  }

  isProcessing = true;

  try {
    console.log('🔔 Starting daily letter processing...');

    // 발송되지 않은 모든 일기 조회
    const unsentDiaries = db.prepare(`
      SELECT de.*, u.id as user_id, u.email, u.name 
      FROM diary_entries de
      JOIN users u ON de.user_id = u.id
      WHERE de.sent_at IS NULL
    `).all() as any[];

    console.log(`📝 Found ${unsentDiaries.length} diary entries to process`);

    if (unsentDiaries.length === 0) {
      console.log('🎉 No diaries to process');
      return;
    }

    // 각 일기에 대해 처리
    for (const diary of unsentDiaries) {
      try {
        console.log(`🎯 Processing diary for user: ${diary.name || diary.email}`);

        // 사용자의 명언 조회
        const phrases = db.prepare(
          'SELECT * FROM favorite_phrases WHERE user_id = ?'
        ).all(diary.user_id);

        // 랜덤 명언 선택
        const randomPhrase = phrases.length > 0 
          ? phrases[Math.floor(Math.random() * phrases.length)] as any
          : { content: '오늘도 좋은 하루 되세요', author: '익명' };

        // AI 편지 생성
        const letterContent = await generateLetter(
          diary.content,
          diary.mood || '평온함',
          randomPhrase.content,
          randomPhrase.author || '작자미상'
        );

        console.log('✅ Letter generated successfully');

        // 이메일 발송
        const emailSent = await sendDailyLetter(
          diary.email,
          diary.name,
          letterContent
        );

        if (emailSent) {
          // 발송 완료 표시
          db.prepare(
            'UPDATE diary_entries SET sent_at = ? WHERE id = ?'
          ).run(new Date().toISOString(), diary.id);

          console.log(`✅ Letter sent successfully to ${diary.email}`);
          console.log(`📧 Marked diary #${diary.id} as sent`);
        } else {
          console.error(`❌ Failed to send letter to ${diary.email}`);
        }

      } catch (error) {
        console.error(`❌ Error processing diary #${diary.id}:`, error);
      }
    }

    console.log('🎉 Daily letter processing complete!');

  } catch (error) {
    console.error('❌ Error in processAndSendLetters:', error);
  } finally {
    isProcessing = false;
  }
}

export function startScheduler() {
  // 매일 오전 7시 (Asia/Seoul) 실행
  cron.schedule('0 7 * * *', async () => {
    console.log('⏰ Scheduled task triggered at 7:00 AM (Asia/Seoul)');
    await processAndSendLetters();
  }, {
    timezone: 'Asia/Seoul'
  });

  console.log('⏰ Scheduler initialized: Daily at 7:00 AM (Asia/Seoul)');
}