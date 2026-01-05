import cron from 'node-cron';
import { db } from '../utils/db.js';
import { generateLetter } from './gemini.js';
import { generateEmailHTML } from '../templates/email.js';
import { sendEmail } from './mailer.js';

export class SchedulerService {
  private job: cron.ScheduledTask | null = null;

  startScheduler() {
    // 매일 오전 7시 (한국 시간)
    this.job = cron.schedule('0 7 * * *', async () => {
      console.log('📮 Starting daily letter generation...');
      await this.processDailyLetters();
    }, {
      timezone: 'Asia/Seoul'
    });

    console.log('✅ Scheduler started - Letters will be sent at 7:00 AM KST');
  }

  async processDailyLetters() {
    try {
      // 발송 대기 중인 일기 조회 (어제 작성 + 미발송)
      const pendingDiaries = db.getDB().prepare(`
        SELECT * FROM diary_entries 
        WHERE DATE(created_at) = DATE('now', '-1 day')
          AND sent_at IS NULL
      `).all() as any[];

      console.log(`📝 Found ${pendingDiaries.length} diaries to process`);

      for (const diary of pendingDiaries) {
        try {
          // 사용자 정보 조회
          const user = db.getDB().prepare('SELECT * FROM users WHERE id = ?').get(diary.user_id) as any;
          
          if (!user || !user.email) {
            console.log(`⚠️ User not found or no email: ${diary.user_id}`);
            continue;
          }

          // 명언 조회 (랜덤 1개)
          const allPhrases = db.getDB().prepare('SELECT * FROM favorite_phrases WHERE user_id = ?').all(diary.user_id) as any[];
          const phrases = allPhrases.length > 0 ? [allPhrases[Math.floor(Math.random() * allPhrases.length)]] : [];

          console.log(`📖 Processing diary for ${user.name || user.email}`);
          console.log(`💬 Selected ${phrases.length} phrase(s) from ${allPhrases.length} total`);

          // AI 편지 생성
          const letterContent = await generateLetter(user, diary, phrases);

          // 이메일 HTML 생성
          const emailHTML = generateEmailHTML(user.name || user.email, letterContent);

          // 이메일 발송
          await sendEmail({
            to: user.email,
            subject: `${user.name}님, 오늘의 편지가 도착했습니다 ✉️`,
            html: emailHTML
          });

          // 발송 완료 표시
          db.getDB().prepare('UPDATE diary_entries SET sent_at = CURRENT_TIMESTAMP WHERE id = ?').run(diary.id);

          console.log(`✅ Letter sent to ${user.email}`);

        } catch (error) {
          console.error(`❌ Failed to process diary ${diary.id}:`, error);
        }
      }

    } catch (error) {
      console.error('❌ Daily letter processing failed:', error);
    }
  }

  async triggerNow() {
    console.log('🔧 Manual trigger activated');
    await this.processDailyLetters();
  }

  stopScheduler() {
    if (this.job) {
      this.job.stop();
      console.log('🛑 Scheduler stopped');
    }
  }
}
