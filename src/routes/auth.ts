import { Hono } from 'hono';
import bcrypt from 'bcrypt';
import { db } from '../utils/db.js';
import { generateToken } from '../middleware/auth.js';

const auth = new Hono();

// 회원가입
auth.post('/signup', async (c) => {
  try {
    const { username, email, name, password } = await c.req.json();

    if (!username || !email || !name || !password) {
      return c.json({ error: 'All fields are required' }, 400);
    }

    if (password.length < 6) {
      return c.json({ error: 'Password must be at least 6 characters' }, 400);
    }

    const existingUsername = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
    if (existingUsername) {
      return c.json({ error: 'Username already exists' }, 409);
    }

    const existingEmail = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (existingEmail) {
      return c.json({ error: 'Email already exists' }, 409);
    }

    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);

    const result = db.prepare(
      'INSERT INTO users (email, name, username, password_hash) VALUES (?, ?, ?, ?)'
    ).run(email, name, username, password_hash);

    const userId = result.lastInsertRowid as number;

    const token = generateToken({
      userId,
      username,
      email
    });

    return c.json({
      success: true,
      message: 'User created successfully',
      token,
      user: { id: userId, username, email, name }
    }, 201);

  } catch (error) {
    console.error('❌ Signup error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// 로그인
auth.post('/login', async (c) => {
  try {
    const { username, password } = await c.req.json();

    if (!username || !password) {
      return c.json({ error: 'Username and password are required' }, 400);
    }

    const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username) as any;

    if (!user) {
      return c.json({ error: 'Invalid username or password' }, 401);
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return c.json({ error: 'Invalid username or password' }, 401);
    }

    const token = generateToken({
      userId: user.id,
      username: user.username,
      email: user.email
    });

    return c.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name
      }
    });

  } catch (error) {
    console.error('❌ Login error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// 현재 사용자 정보
auth.get('/me', async (c) => {
  const user = c.get('user');
  
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  return c.json({ success: true, user });
});

export default auth;