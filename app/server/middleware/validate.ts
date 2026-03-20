import type { Request, Response, NextFunction } from 'express';

/**
 * Standardized API error response. Use instead of inline res.status(N).json({ error: msg })
 * to avoid leaking internal error details to clients.
 *
 * Usage: return apiError(res, 400, 'Invalid agent_id');
 */
export function apiError(res: Response, status: number, message: string) {
  return res.status(status).json({ error: message, status });
}

/**
 * Returns Express middleware that validates required fields in req.body.
 * Responds with 400 and a clear error message if any field is missing or empty.
 *
 * Usage: app.post('/api/foo', required(['name', 'role']), handler)
 */
export function required(fields: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const missing = fields.filter(f => {
      const val = req.body?.[f];
      return val === undefined || val === null || val === '';
    });

    if (missing.length > 0) {
      res.status(400).json({
        error: `Missing required field${missing.length > 1 ? 's' : ''}: ${missing.join(', ')}`,
      });
      return;
    }
    next();
  };
}
