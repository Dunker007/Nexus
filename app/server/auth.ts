import { Router } from 'express';
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import { db } from './db.js';
import { logger } from './logger.js';

export const authRouter = Router();

const client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3001/auth/callback'
);

const JWT_SECRET = process.env.JWT_SECRET || 'nexus-dev-secret-change-in-prod';
const JWT_EXPIRY = '7d';
const IS_PROD = process.env.NODE_ENV === 'production';

// ─── Token helpers ────────────────────────────────────────────────────────────

export function signToken(payload: { id: string; email: string; name: string }) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRY });
}

export function verifyToken(token: string): { id: string; email: string; name: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as any;
  } catch {
    return null;
  }
}

// ─── GET /api/auth/url — returns Google OAuth consent URL ────────────────────
authRouter.get('/url', (_req, res) => {
  const url = client.generateAuthUrl({
    access_type: 'offline',
    scope: ['openid', 'email', 'profile'],
    prompt: 'select_account',
  });
  res.json({ url });
});

// ─── GET /api/auth/callback — exchanges code for token, sets cookie ───────────
authRouter.get('/callback', async (req, res) => {
  const { code } = req.query as { code?: string };
  if (!code) return res.status(400).json({ error: 'Missing code' });

  try {
    const { tokens } = await client.getToken(code);
    client.setCredentials(tokens);

    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token!,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload()!;

    const userId = payload.sub;
    const email = payload.email!;
    const name = payload.name || email;
    const picture = payload.picture || '';

    // Upsert user
    db.prepare(`
      INSERT INTO users (id, email, name, picture, last_seen)
      VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(id) DO UPDATE SET name=excluded.name, picture=excluded.picture, last_seen=CURRENT_TIMESTAMP
    `).run(userId, email, name, picture);

    const token = signToken({ id: userId, email, name });

    // Set HTTP-only cookie
    res.cookie('nexus_token', token, {
      httpOnly: true,
      secure: IS_PROD,
      sameSite: IS_PROD ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/',
    });

    logger.info('User authenticated', { email, userId });

    // Redirect to frontend
    res.redirect('/');
  } catch (e: any) {
    logger.error('OAuth callback error', { message: e.message });
    res.redirect('/?auth_error=1');
  }
});

// ─── GET /api/auth/me — returns current user from cookie ─────────────────────
authRouter.get('/me', (req, res) => {
  const token = (req as any).cookies?.nexus_token;
  if (!token) return res.status(401).json({ user: null });

  const user = verifyToken(token);
  if (!user) return res.status(401).json({ user: null });

  res.json({ user });
});

// ─── POST /api/auth/logout — clears cookie ────────────────────────────────────
authRouter.post('/logout', (_req, res) => {
  res.clearCookie('nexus_token', { path: '/' });
  res.json({ success: true });
});
