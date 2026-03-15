/**
 * Returns Express middleware that validates required fields in req.body.
 * Responds with 400 and a clear error message if any field is missing or empty.
 *
 * Usage: app.post('/api/foo', required(['name', 'role']), handler)
 */
export function required(fields) {
    return (req, res, next) => {
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
