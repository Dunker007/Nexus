import { Router } from 'express';
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import { getPrisma } from './db.js';
import { logger } from './logger.js';
export const authRouter = Router();
if (!process.env.JWT_SECRET) {
    console.error('[auth] FATAL: JWT_SECRET environment variable is not set. Refusing to start.');
    process.exit(1);
}
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRY = '7d';
const IS_PROD = process.env.NODE_ENV === 'production';
function getOAuthClient() {
    const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || (IS_PROD ? 'https://dlxstudios.ai/api/auth/callback' : 'http://localhost:3001/api/auth/callback');
    return new OAuth2Client(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET, REDIRECT_URI);
}
// ─── Token helpers ────────────────────────────────────────────────────────────
export function signToken(payload) {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRY });
}
export function verifyToken(token) {
    try {
        return jwt.verify(token, JWT_SECRET);
    }
    catch {
        return null;
    }
}
// ─── GET /api/auth/url — returns Google OAuth consent URL ────────────────────
authRouter.get('/url', (_req, res) => {
    const client = getOAuthClient();
    const url = client.generateAuthUrl({
        access_type: 'offline',
        scope: ['openid', 'email', 'profile'],
        prompt: 'select_account',
    });
    res.json({ url });
});
// ─── GET /api/auth/callback — exchanges code for token, sets cookie ───────────
authRouter.get('/callback', async (req, res) => {
    const { code } = req.query;
    if (!code)
        return res.status(400).json({ error: 'Missing code' });
    try {
        const client = getOAuthClient();
        const { tokens } = await client.getToken(code);
        client.setCredentials(tokens);
        const ticket = await client.verifyIdToken({
            idToken: tokens.id_token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        const userId = payload.sub;
        const email = payload.email;
        const name = payload.name || email;
        const picture = payload.picture || '';
        // Upsert user
        await getPrisma().users.upsert({
            where: { id: userId },
            update: { name, picture, last_seen: new Date() },
            create: { id: userId, email, name, picture, last_seen: new Date() }
        });
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
    }
    catch (e) {
        logger.error('OAuth callback error', { message: e.message });
        res.redirect('/?auth_error=1');
    }
});
// ─── GET /api/auth/me — returns current user from cookie ─────────────────────
authRouter.get('/me', (req, res) => {
    const token = req.cookies?.nexus_token;
    if (!token)
        return res.status(401).json({ user: null });
    const user = verifyToken(token);
    if (!user)
        return res.status(401).json({ user: null });
    res.json({ user });
});
// ─── POST /api/auth/logout — clears cookie ────────────────────────────────────
authRouter.post('/logout', (_req, res) => {
    res.clearCookie('nexus_token', { path: '/' });
    res.json({ success: true });
});
