import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dataDir = join(__dirname, '../../data');
const dbPath = join(dataDir, 'database.json');

// Ensure data directory exists
if (!existsSync(dataDir)) {
  mkdirSync(dataDir, { recursive: true });
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
  if (existsSync(dbPath)) {
    const data = readFileSync(dbPath, 'utf-8');
    return JSON.parse(data);
  }
  return {
    users: [],
    diary_entries: [],
    favorite_phrases: [],
    _counters: { users: 0, diary_entries: 0, favorite_phrases: 0 }
  };
}

// Save database
function saveDb(data: Database): void {
  writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf-8');
}

// Get current database
let dbCache: Database = loadDb();

// Execute SQL-like operations
export function exec(sql: string): void {
  // This is a simplified version for table creation
  // In JSON mode, tables are already initialized
  console.log('Table creation simulated:', sql.substring(0, 50) + '...');
}

// Prepare statement
export function prepare(sql: string) {
  const db = loadDb();
  
  return {
    run(...params: any[]) {
      const sqlLower = sql.toLowerCase();
      
      // INSERT INTO users
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
      
      // INSERT INTO diary_entries
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
        return { lastInsertRowid: id, changes: 1 };
      }
      
      // INSERT INTO favorite_phrases
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
      
      // UPDATE diary_entries SET sent_at
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
      
      // DELETE FROM favorite_phrases
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
      
      // SELECT FROM users
      if (sqlLower.includes('from users')) {
        if (sqlLower.includes('where email')) {
          return db.users.find(u => u.email === params[0]);
        }
        if (sqlLower.includes('where id')) {
          return db.users.find(u => u.id === params[0]);
        }
      }
      
      return undefined;
    },
    
    all(...params: any[]) {
      const db = loadDb();
      const sqlLower = sql.toLowerCase();
      
      // SELECT FROM diary_entries
      if (sqlLower.includes('from diary_entries')) {
        let results = db.diary_entries.filter(d => d.user_id === params[0]);
        
        // Filter by date if specified
        if (sqlLower.includes('date(created_at)') && params[1]) {
          const targetDate = params[1];
          results = results.filter(d => d.created_at.startsWith(targetDate));
        }
        
        // Filter unsent
        if (sqlLower.includes('sent_at is null')) {
          results = results.filter(d => !d.sent_at);
        }
        
        // Order by created_at DESC
        if (sqlLower.includes('order by created_at desc')) {
          results.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        }
        
        // Limit
        if (sqlLower.includes('limit')) {
          const limit = params[params.length - 1];
          results = results.slice(0, limit);
        }
        
        return results;
      }
      
      // SELECT FROM favorite_phrases
      if (sqlLower.includes('from favorite_phrases')) {
        let results = db.favorite_phrases.filter(p => p.user_id === params[0]);
        
        // Random order
        if (sqlLower.includes('random()')) {
          results = results.sort(() => Math.random() - 0.5);
        }
        
        // Order by created_at DESC
        if (sqlLower.includes('order by created_at desc')) {
          results.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        }
        
        // Limit
        if (sqlLower.includes('limit')) {
          const limit = params[params.length - 1];
          results = results.slice(0, limit);
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