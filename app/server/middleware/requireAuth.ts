import type { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../auth.js';

export interface AuthRequest extends Request {
  user?: { id: string; email: string; name: string };
}

/**
 * Middleware that validates the nexus_token cookie.
 * Attaches req.user if valid; returns 401 otherwise.
 */
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = (req as any).cookies?.nexus_token;
  if (!token) return res.status(401).json({ error: 'Not authenticated' });

  const user = verifyToken(token);
  if (!user) return res.status(401).json({ error: 'Invalid or expired session' });

  (req as any).user = user;
  next();
}
