import { Hono } from 'hono';
import { sign, verify } from 'hono/jwt';
import { db } from '../utils/db.js';
import bcrypt from 'bcryptjs';

const app = new Hono();

// Environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Types
interface CustomJWTPayload {
  userId: number;
  username: string;
  exp: number;
  [key: string]: any;
}

// 회원가입
app.post('/signup', async (c) => {
  try {
    const { username, email, name, password } = await c.req.json();

    // Validation
    if (!username || !email || !name || !password) {
      return c.json({ error: 'All fields are required' }, 400);
    }

    // Check if user already exists
    if (db.checkUserExists(username, email)) {
      return c.json({ error: 'Username or email already exists' }, 409);
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Insert user
    const userId = db.createUserWithPassword(username, email, name, passwordHash);

    // Generate JWT token
    const token = await sign(
      {
        userId,
        username,
        exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 7) // 7 days
      },
      JWT_SECRET
    );

    return c.json({
      success: true,
      message: 'User created successfully',
      token,
      user: {
        id: userId,
        username,
        email,
        name
      }
    });

  } catch (error) {
    console.error('Signup error:', error);
    return c.json({ error: 'Failed to create user' }, 500);
  }
});

// 로그인
app.post('/login', async (c) => {
  try {
    const { username, password } = await c.req.json();

    // Validation
    if (!username || !password) {
      return c.json({ error: 'Username and password are required' }, 400);
    }

    // Get user
    const user = db.getUserByUsername(username);

    if (!user) {
      return c.json({ error: 'Invalid credentials' }, 401);
    }

    // Verify password
    const passwordValid = await bcrypt.compare(password, user.password_hash);
    if (!passwordValid) {
      return c.json({ error: 'Invalid credentials' }, 401);
    }

    // Generate JWT token
    const token = await sign(
      {
        userId: user.id,
        username: user.username,
        exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 7) // 7 days
      },
      JWT_SECRET
    );

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
    console.error('Login error:', error);
    return c.json({ error: 'Failed to login' }, 500);
  }
});

// 현재 사용자 정보 조회 (JWT 인증 필요)
app.get('/me', async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const token = authHeader.substring(7);
    
    // Verify JWT
    const payload = await verify(token, JWT_SECRET) as CustomJWTPayload;
    
    // Get user info
    const user = db.getUserById(payload.userId);

    if (!user) {
      return c.json({ error: 'User not found' }, 404);
    }

    return c.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name,
        createdAt: user.created_at
      }
    });

  } catch (error) {
    console.error('Auth error:', error);
    return c.json({ error: 'Unauthorized - Invalid token' }, 401);
  }
});

export default app;
