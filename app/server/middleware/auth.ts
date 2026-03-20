import type { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../auth.js';

/**
 * Middleware that validates the nexus_token cookie and attaches the decoded
 * user to req.user. Returns 401 if the token is missing or invalid.
 *
 * Usage: router.get('/protected', requireAuth, handler)
 */
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = (req as any).cookies?.nexus_token;
  if (!token) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const user = verifyToken(token);
  if (!user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  (req as any).user = user;
  next();
}
