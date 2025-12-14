import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';

// 절대 경로 사용 - Render Disk 마운트 경로
const DB_PATH = '/opt/render/project/data/database.json';
const DATA_DIR = '/opt/render/project/data';

console.log(`📁 Using database path: ${DB_PATH}`);

// Ensure data directory exists
if (!existsSync(DATA_DIR)) {
  mkdirSync(DATA_DIR, { recursive: true });
  console.log(`✅ Created data directory: ${DATA_DIR}`);
}

export interface User {
  id: number;
  email: string;
  name: string;
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
  _counters: {
    users: number;
    diary_entries: number;
    favorite_phrases: number;
  };
}

// Load or initialize database
function loadDb(): Database {
  try {
    if (existsSync(DB_PATH)) {
      const data = readFileSync(DB_PATH, 'utf-8');
      const db = JSON.parse(data);
      console.log(`📊 Loaded database: ${db.diary_entries.length} diaries, ${db.favorite_phrases.length} phrases`);
      return db;
    }
  } catch (error) {
    console.error('⚠️  Error loading database:', error);
  }
  
  console.log('🆕 Creating new database');
  return {
    users: [],
    diary_entries: [],
    favorite_phrases: [],
    _counters: { users: 0, diary_entries: 0, favorite_phrases: 0 }
  };
}

// Save database
function saveDb(data: Database): void {
  try {
    writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
    console.log(`💾 Database saved: ${data.diary_entries.length} diaries`);
  } catch (error) {
    console.error('❌ Error saving database:', error);
  }
}

// Execute SQL-like operations
export function exec(sql: string): void {
  console.log('Table creation simulated:', sql.substring(0, 50) + '...');
}

// Prepare statement
export function prepare(sql: string) {
  return {
    run(...params: any[]) {
      const db = loadDb();
      const sqlLower = sql.toLowerCase();
      
      if (sqlLower.includes('insert into users')) {
        const [email, name] = params;
        const id = ++db._counters.users;
        db.users.push({
          id,
          email,
          name,
          created_at: new Date().toISOString()
        });
        saveDb(db);
        return { lastInsertRowid: id, changes: 1 };
      }
      
      if (sqlLower.includes('insert into diary_entries')) {
        const [user_id, content, mood] = params;
        const id = ++db._counters.diary_entries;
        db.diary_entries.push({
          id,
          user_id,
          content,
          mood: mood || undefined,
          created_at: new Date().toISOString()
        });
        saveDb(db);
        console.log(`✅ Diary saved: ID ${id}`);
        return { lastInsertRowid: id, changes: 1 };
      }
      
      if (sqlLower.includes('insert into favorite_phrases')) {
        const [user_id, content, author] = params;
        const id = ++db._counters.favorite_phrases;
        db.favorite_phrases.push({
          id,
          user_id,
          content,
          author: author || undefined,
          created_at: new Date().toISOString()
        });
        saveDb(db);
        return { lastInsertRowid: id, changes: 1 };
      }
      
      if (sqlLower.includes('update diary_entries') && sqlLower.includes('sent_at')) {
        const [id] = params;
        const entry = db.diary_entries.find(e => e.id === id);
        if (entry) {
          entry.sent_at = new Date().toISOString();
          saveDb(db);
          return { changes: 1 };
        }
        return { changes: 0 };
      }
      
      if (sqlLower.includes('delete from favorite_phrases')) {
        const [id, user_id] = params;
        const index = db.favorite_phrases.findIndex(p => p.id === id && p.user_id === user_id);
        if (index !== -1) {
          db.favorite_phrases.splice(index, 1);
          saveDb(db);
          return { changes: 1 };
        }
        return { changes: 0 };
      }
      
      return { changes: 0 };
    },
    
    get(...params: any[]) {
      const db = loadDb();
      const sqlLower = sql.toLowerCase();
      
      if (sqlLower.includes('from users')) {
        if (sqlLower.includes('where email')) {
          return db.users.find(u => u.email === params[0]);
        }
        if (sqlLower.includes('where id')) {
          return db.users.find(u => u.id === params[0]);
        }
      }
      
      if (sqlLower.includes('from favorite_phrases') && sqlLower.includes('random()')) {
        const user_id = params[0];
        const phrases = db.favorite_phrases.filter(p => p.user_id === user_id);
        if (phrases.length > 0) {
          return phrases[Math.floor(Math.random() * phrases.length)];
        }
      }
      
      return undefined;
    },
    
    all(...params: any[]) {
      const db = loadDb();
      const sqlLower = sql.toLowerCase();
      
      console.log(`🔍 Querying database: ${db.diary_entries.length} total diaries`);
      
      if (sqlLower.includes('from diary_entries')) {
        let results = db.diary_entries;
        
        // Filter unsent
        if (sqlLower.includes('sent_at is null')) {
          results = results.filter(d => !d.sent_at);
          console.log(`📝 Unsent diaries: ${results.length}`);
        }
        
        // Order by created_at DESC
        if (sqlLower.includes('order by') && sqlLower.includes('desc')) {
          results.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        }
        
        // Limit
        const limitMatch = sqlLower.match(/limit\s+(\d+)/);
        if (limitMatch) {
          const limit = parseInt(limitMatch[1]);
          results = results.slice(0, limit);
        }
        
        // Join with users if needed
        if (sqlLower.includes('join users')) {
          return results.map(d => ({
            ...d,
            email: db.users.find(u => u.id === d.user_id)?.email || '',
            name: db.users.find(u => u.id === d.user_id)?.name || ''
          }));
        }
        
        return results;
      }
      
      if (sqlLower.includes('from favorite_phrases')) {
        let results = db.favorite_phrases;
        
        if (params[0]) {
          results = results.filter(p => p.user_id === params[0]);
        }
        
        if (sqlLower.includes('order by created_at desc')) {
          results.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        }
        
        return results;
      }
      
      return [];
    }
  };
}

export function pragma(sql: string): void {
  // No-op for JSON database
}

export const db = { exec, prepare, pragma };
export default db;