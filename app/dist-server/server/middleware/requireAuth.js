import { verifyToken } from '../auth.js';
/**
 * Middleware that validates the nexus_token cookie.
 * Attaches req.user if valid; returns 401 otherwise.
 */
export function requireAuth(req, res, next) {
    const token = req.cookies?.nexus_token;
    if (!token)
        return res.status(401).json({ error: 'Not authenticated' });
    const user = verifyToken(token);
    if (!user)
        return res.status(401).json({ error: 'Invalid or expired session' });
    req.user = user;
    next();
}
