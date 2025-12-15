import { join } from 'path';
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';

// Render 환경 감지
const isRender = process.env.RENDER === 'true';

// 데이터 디렉토리 경로 설정
const dataDir = isRender 
  ? '/opt/render/project/data' 
  : join(process.cwd(), 'data');

const dbPath = join(dataDir, 'database.json');

console.log(`📁 Using database path: ${dbPath}`);

// 데이터베이스 타입 정의
export interface User {
  id: number;
  email: string;
  name: string;
  username?: string;
  password_hash?: string;
  created_at: string;
}

export interface DiaryEntry {
  id: number;
  user_id: number;
  content: string;
  mood?: string;
  created_at: string;
  sent_at?: string;
}

export interface FavoritePhrase {
  id: number;
  user_id: number;
  content: string;
  author?: string;
  created_at: string;
}

interface Database {
  users: User[];
  diary_entries: DiaryEntry[];
  favorite_phrases: FavoritePhrase[];
}

// 데이터베이스 로드
function loadDb(): Database {
  if (!existsSync(dataDir)) {
    mkdirSync(dataDir, { recursive: true });
  }

  if (!existsSync(dbPath)) {
    const initialDb: Database = {
      users: [],
      diary_entries: [],
      favorite_phrases: []
    };
    saveDb(initialDb);
    return initialDb;
  }

  const data = readFileSync(dbPath, 'utf-8');
  const db = JSON.parse(data) as Database;
  
  console.log(`📊 Loaded database: ${db.diary_entries.length} diaries, ${db.favorite_phrases.length} phrases, ${db.users.length} users`);
  
  return db;
}

// 데이터베이스 저장
function saveDb(db: Database): void {
  writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf-8');
}

// SQL-like 인터페이스
export const db = {
  prepare: (sql: string) => {
    return {
      run: (...params: any[]) => {
        const database = loadDb();
        
        // INSERT INTO users
        if (sql.includes('INSERT INTO users')) {
          const [email, name, username, password_hash] = params;
          const newUser: User = {
            id: database.users.length > 0 ? Math.max(...database.users.map(u => u.id)) + 1 : 1,
            email,
            name,
            username,
            password_hash,
            created_at: new Date().toISOString()
          };
          database.users.push(newUser);
          saveDb(database);
          return { lastInsertRowid: newUser.id };
        }
        
        // INSERT INTO diary_entries
        if (sql.includes('INSERT INTO diary_entries')) {
          const [user_id, content, mood] = params;
          const newEntry: DiaryEntry = {
            id: database.diary_entries.length > 0 ? Math.max(...database.diary_entries.map(d => d.id)) + 1 : 1,
            user_id,
            content,
            mood,
            created_at: new Date().toISOString()
          };
          database.diary_entries.push(newEntry);
          saveDb(database);
          return { lastInsertRowid: newEntry.id };
        }
        
        // INSERT INTO favorite_phrases
        if (sql.includes('INSERT INTO favorite_phrases')) {
          const [user_id, content, author] = params;
          const newPhrase: FavoritePhrase = {
            id: database.favorite_phrases.length > 0 ? Math.max(...database.favorite_phrases.map(p => p.id)) + 1 : 1,
            user_id,
            content,
            author,
            created_at: new Date().toISOString()
          };
          database.favorite_phrases.push(newPhrase);
          saveDb(database);
          return { lastInsertRowid: newPhrase.id };
        }
        
        // UPDATE diary_entries SET sent_at
        if (sql.includes('UPDATE diary_entries') && sql.includes('sent_at')) {
          const [sent_at, id] = params;
          const entry = database.diary_entries.find(d => d.id === id);
          if (entry) {
            entry.sent_at = sent_at;
            saveDb(database);
          }
          return { changes: 1 };
        }
        
        // DELETE FROM favorite_phrases
        if (sql.includes('DELETE FROM favorite_phrases')) {
          const [id] = params;
          database.favorite_phrases = database.favorite_phrases.filter(p => p.id !== id);
          saveDb(database);
          return { changes: 1 };
        }
        
        return { lastInsertRowid: 0, changes: 0 };
      },
      
      get: (...params: any[]) => {
        const database = loadDb();
        
        // SELECT * FROM users WHERE email
        if (sql.includes('SELECT') && sql.includes('users') && sql.includes('email')) {
          const [email] = params;
          return database.users.find(u => u.email === email);
        }
        
        // SELECT * FROM users WHERE username
        if (sql.includes('SELECT') && sql.includes('users') && sql.includes('username')) {
          const [username] = params;
          return database.users.find(u => u.username === username);
        }
        
        // SELECT * FROM users WHERE id
        if (sql.includes('SELECT') && sql.includes('users') && sql.includes('id')) {
          const [id] = params;
          return database.users.find(u => u.id === id);
        }
        
        return undefined;
      },
      
      all: (...params: any[]) => {
        const database = loadDb();
        
        // SELECT * FROM diary_entries WHERE user_id ORDER BY created_at DESC LIMIT
        if (sql.includes('diary_entries') && sql.includes('ORDER BY created_at DESC')) {
          const [user_id, limit] = params;
          return database.diary_entries
            .filter(d => d.user_id === user_id)
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
            .slice(0, limit || 10);
        }
        
        // SELECT * FROM diary_entries WHERE sent_at IS NULL
        if (sql.includes('diary_entries') && sql.includes('sent_at IS NULL')) {
          return database.diary_entries.filter(d => !d.sent_at);
        }
        
        // SELECT * FROM favorite_phrases WHERE user_id
        if (sql.includes('favorite_phrases') && sql.includes('user_id')) {
          const [user_id] = params;
          return database.favorite_phrases.filter(p => p.user_id === user_id);
        }
        
        // SELECT * FROM favorite_phrases (all)
        if (sql.includes('favorite_phrases')) {
          return database.favorite_phrases;
        }
        
        return [];
      }
    };
  }
};