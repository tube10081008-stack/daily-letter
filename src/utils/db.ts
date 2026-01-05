import Database from 'better-sqlite3';
import { join } from 'path';

export interface User {
  id?: number;
  username?: string;
  email: string;
  name?: string;
  password_hash?: string;
  gmail_refresh_token?: string;
  timezone: string;
  created_at?: string;
}

export interface DiaryEntry {
  id?: number;
  user_id: number;
  content: string;
  mood?: string;
  created_at?: string;
  sent_at?: string;
}

export interface FavoritePhrase {
  id?: number;
  user_id: number;
  content: string;
  author?: string;
  added_at?: string;
}

class DatabaseService {
  private db: Database.Database;

  constructor(dbPath: string = join(process.cwd(), 'data', 'daily-letter.db')) {
    this.db = new Database(dbPath);
    this.initTables();
  }

  // 직접 DB 접근용 (scheduler에서 사용)
  getDB() {
    return this.db;
  }

  private initTables() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        email TEXT UNIQUE NOT NULL,
        name TEXT,
        password_hash TEXT,
        gmail_refresh_token TEXT,
        timezone TEXT DEFAULT 'Asia/Seoul',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS diary_entries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        content TEXT NOT NULL,
        mood TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        sent_at DATETIME,
        FOREIGN KEY (user_id) REFERENCES users(id)
      );

      CREATE TABLE IF NOT EXISTS favorite_phrases (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        content TEXT NOT NULL,
        author TEXT,
        added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      );

      CREATE INDEX IF NOT EXISTS idx_diary_user_date ON diary_entries(user_id, created_at);
      CREATE INDEX IF NOT EXISTS idx_phrases_user ON favorite_phrases(user_id);
    `);
  }

  // User operations
  createUser(user: User): User {
    const stmt = this.db.prepare(
      'INSERT INTO users (email, gmail_refresh_token, timezone) VALUES (?, ?, ?)'
    );
    const result = stmt.run(user.email, user.gmail_refresh_token || null, user.timezone);
    return { ...user, id: result.lastInsertRowid as number };
  }

  getUserByEmail(email: string): User | undefined {
    const stmt = this.db.prepare('SELECT * FROM users WHERE email = ?');
    return stmt.get(email) as User | undefined;
  }

  getUserById(id: number): User | undefined {
    const stmt = this.db.prepare('SELECT * FROM users WHERE id = ?');
    return stmt.get(id) as User | undefined;
  }

  getUserByUsername(username: string): any | undefined {
    const stmt = this.db.prepare('SELECT * FROM users WHERE username = ?');
    return stmt.get(username);
  }

  createUserWithPassword(username: string, email: string, name: string, passwordHash: string): number {
    const stmt = this.db.prepare(
      'INSERT INTO users (username, email, name, password_hash, timezone) VALUES (?, ?, ?, ?, ?)'
    );
    const result = stmt.run(username, email, name, passwordHash, 'Asia/Seoul');
    return result.lastInsertRowid as number;
  }

  checkUserExists(username: string, email: string): boolean {
    const stmt = this.db.prepare('SELECT id FROM users WHERE username = ? OR email = ?');
    return stmt.get(username, email) !== undefined;
  }

  // Diary operations
  createDiaryEntry(entry: DiaryEntry): DiaryEntry {
    const stmt = this.db.prepare(
      'INSERT INTO diary_entries (user_id, content, mood) VALUES (?, ?, ?)'
    );
    const result = stmt.run(entry.user_id, entry.content, entry.mood || null);
    return { ...entry, id: result.lastInsertRowid as number };
  }

  getYesterdayDiary(userId: number): DiaryEntry | undefined {
    const stmt = this.db.prepare(`
      SELECT * FROM diary_entries 
      WHERE user_id = ? 
        AND DATE(created_at) = DATE('now', '-1 day')
        AND sent_at IS NULL
      ORDER BY created_at DESC 
      LIMIT 1
    `);
    return stmt.get(userId) as DiaryEntry | undefined;
  }

  markDiaryAsSent(diaryId: number): void {
    const stmt = this.db.prepare(
      'UPDATE diary_entries SET sent_at = CURRENT_TIMESTAMP WHERE id = ?'
    );
    stmt.run(diaryId);
  }

  getRecentDiaries(userId: number, limit: number = 10): DiaryEntry[] {
    const stmt = this.db.prepare(
      'SELECT * FROM diary_entries WHERE user_id = ? ORDER BY created_at DESC LIMIT ?'
    );
    return stmt.all(userId, limit) as DiaryEntry[];
  }

  // Favorite phrases operations
  addFavoritePhrase(phrase: FavoritePhrase): FavoritePhrase {
    const stmt = this.db.prepare(
      'INSERT INTO favorite_phrases (user_id, content, author) VALUES (?, ?, ?)'
    );
    const result = stmt.run(phrase.user_id, phrase.content, phrase.author || null);
    return { ...phrase, id: result.lastInsertRowid as number };
  }

  getRandomPhrase(userId: number): FavoritePhrase | undefined {
    const stmt = this.db.prepare(
      'SELECT * FROM favorite_phrases WHERE user_id = ? ORDER BY RANDOM() LIMIT 1'
    );
    return stmt.get(userId) as FavoritePhrase | undefined;
  }

  getAllPhrases(userId: number): FavoritePhrase[] {
    const stmt = this.db.prepare(
      'SELECT * FROM favorite_phrases WHERE user_id = ? ORDER BY added_at DESC'
    );
    return stmt.all(userId) as FavoritePhrase[];
  }

  deletePhrase(phraseId: number, userId: number): boolean {
    const stmt = this.db.prepare(
      'DELETE FROM favorite_phrases WHERE id = ? AND user_id = ?'
    );
    const result = stmt.run(phraseId, userId);
    return result.changes > 0;
  }

  close() {
    this.db.close();
  }
}

export const db = new DatabaseService();
