import cron from 'node-cron';
import { db } from '../utils/db.js';
import { generateLetter } from './gemini.js';
import { sendDailyLetter } from './mailer.js';
import type { DiaryEntry, FavoritePhrase, User } from '../utils/db.js';

export async function processAndSendLetters(): Promise<void> {
  console.log('\n🔔 Starting daily letter processing...');
  
  try {
    // Get yesterday's unsent diaries
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    const diaries = db.prepare(`
      SELECT de.*, u.email, u.name
      FROM diary_entries de
      JOIN users u ON de.user_id = u.id
      WHERE DATE(de.created_at) = DATE(?)
        AND de.sent_at IS NULL
    `).all(yesterdayStr) as (DiaryEntry & User)[];

    console.log(`📝 Found ${diaries.length} diary entries to process`);

    for (const diary of diaries) {
      try {
        // Get a random favorite phrase for this user
        const phrase = db.prepare(`
          SELECT * FROM favorite_phrases
          WHERE user_id = ?
          ORDER BY RANDOM()
          LIMIT 1
        `).get(diary.user_id) as FavoritePhrase | undefined;

        if (!phrase) {
          console.log(`⚠️  No favorite phrases found for user ${diary.user_id}`);
          continue;
        }

        console.log(`🤖 Generating letter for ${diary.email}...`);

        // Generate letter content with AI
        const letterContent = await generateLetter(
          diary.content,
          diary.mood,
          phrase.content,
          phrase.author
        );

        // Send email
        const today = new Date().toLocaleDateString('ko-KR', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          weekday: 'long'
        });

        const emailSent = await sendDailyLetter({
          recipientEmail: diary.email,
          recipientName: diary.name,
          date: today,
          letterContent
        });

        if (emailSent) {
          // Mark diary as sent
          db.prepare(`
            UPDATE diary_entries
            SET sent_at = datetime('now', 'localtime')
            WHERE id = ?
          `).run(diary.id);

          console.log(`✅ Letter sent successfully to ${diary.email}`);
        } else {
          console.log(`❌ Failed to send letter to ${diary.email}`);
        }

      } catch (error) {
        console.error(`❌ Error processing diary ${diary.id}:`, error);
      }
    }

    console.log('🎉 Daily letter processing complete!\n');
  } catch (error) {
    console.error('❌ Fatal error in letter processing:', error);
  }
}

export function startScheduler(): void {
  // Run every day at 7:00 AM (Asia/Seoul timezone)
  cron.schedule('0 7 * * *', processAndSendLetters, {
    timezone: 'Asia/Seoul'
  });

  console.log('⏰ Scheduler started: Daily at 7:00 AM (Asia/Seoul)');
  console.log('📅 Cron expression: 0 7 * * *');
}