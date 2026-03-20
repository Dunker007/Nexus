import type { Request } from 'express';

/**
 * Extends Express Request with the `user` property attached by requireAuth middleware,
 * and the `cookies` property from cookie-parser.
 * 
 * Use this type in route handlers instead of `(req as any).user`.
 */
export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    name: string;
  };
  cookies: Record<string, string>;
}
