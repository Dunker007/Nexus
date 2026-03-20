import type { Response, NextFunction } from 'express';
import type { AuthRequest } from '../types.js';
import { verifyToken } from '../auth.js';


/**
 * Middleware that validates the nexus_token cookie.
 * Attaches req.user if valid; returns 401 otherwise.
 */
export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const token = req.cookies?.nexus_token;
  if (!token) return res.status(401).json({ error: 'Not authenticated' });

  const user = verifyToken(token);
  if (!user) return res.status(401).json({ error: 'Invalid or expired session' });

  req.user = user;
  next();
}
