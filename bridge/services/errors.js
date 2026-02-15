/**
 * Error Handling Utilities
 * Production-ready error handling with logging and recovery
 */

export class AppError extends Error {
    constructor(message, statusCode = 500, isOperational = true) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        this.timestamp = new Date();
        Error.captureStackTrace(this, this.constructor);
    }
}

export class ValidationError extends AppError {
    constructor(message, field = null) {
        super(message, 400);
        this.field = field;
    }
}

export class AuthenticationError extends AppError {
    constructor(message = 'Authentication required') {
        super(message, 401);
    }
}

export class AuthorizationError extends AppError {
    constructor(message = 'Insufficient permissions') {
        super(message, 403);
    }
}

export class NotFoundError extends AppError {
    constructor(resource = 'Resource') {
        super(`${resource} not found`, 404);
    }
}

export class RateLimitError extends AppError {
    constructor(message = 'Too many requests') {
        super(message, 429);
    }
}

/**
 * Error Logger with Database Persistence
 */
class ErrorLogger {
    constructor() {
        this.errors = []; // In-memory cache for fast access
        this.maxErrors = 1000;
        this.useDatabase = true; // Flag to enable/disable database
        this.dbReady = false;

        // Initialize database connection
        this.initDatabase();
    }

    async initDatabase() {
        try {
            const { errorLog } = await import('./database.js');
            this.db = errorLog;
            this.dbReady = true;
        } catch (error) {
            console.warn('[ErrorLogger] Database not available, using in-memory only:', error.message);
            this.useDatabase = false;
        }
    }

    async log(error, context = {}) {
        const errorLogEntry = {
            message: error.message,
            stack: error.stack,
            statusCode: error.statusCode || 500,
            timestamp: new Date(),
            context,
            isOperational: error.isOperational !== false
        };

        // Add to in-memory cache
        this.errors.push(errorLogEntry);

        // Keep only last maxErrors in memory
        if (this.errors.length > this.maxErrors) {
            this.errors = this.errors.slice(-this.maxErrors);
        }

        // Log to console in development
        if (process.env.NODE_ENV !== 'production') {
            console.error('[ERROR]', errorLogEntry);
        }

        // Persist to database (async, non-blocking)
        if (this.useDatabase && this.dbReady) {
            try {
                await this.db.create(error, context);
            } catch (dbError) {
                console.warn('[ErrorLogger] Failed to persist to database:', dbError.message);
            }
        }

        return errorLogEntry;
    }

    async getErrors(limit = 100) {
        // Try to get from database first
        if (this.useDatabase && this.dbReady) {
            try {
                const dbErrors = await this.db.getRecent(limit);
                return dbErrors.map(e => ({
                    message: e.message,
                    stack: e.stack,
                    statusCode: e.statusCode,
                    timestamp: e.timestamp,
                    context: {
                        method: e.method,
                        url: e.url,
                        body: e.body ? JSON.parse(e.body) : null,
                        params: e.params ? JSON.parse(e.params) : null,
                        query: e.query ? JSON.parse(e.query) : null,
                    },
                    isOperational: e.isOperational
                }));
            } catch (error) {
                console.warn('[ErrorLogger] Failed to get errors from database:', error.message);
            }
        }

        // Fallback to in-memory
        return this.errors.slice(-limit);
    }

    async getErrorStats() {
        // Try to get from database first
        if (this.useDatabase && this.dbReady) {
            try {
                return await this.db.getStats();
            } catch (error) {
                console.warn('[ErrorLogger] Failed to get stats from database:', error.message);
            }
        }

        // Fallback to in-memory calculation
        const now = Date.now();
        const last24h = this.errors.filter(e => now - e.timestamp < 24 * 60 * 60 * 1000);
        const lastHour = this.errors.filter(e => now - e.timestamp < 60 * 60 * 1000);

        return {
            total: this.errors.length,
            last24Hours: last24h.length,
            lastHour: lastHour.length,
            operational: this.errors.filter(e => e.isOperational).length,
            critical: this.errors.filter(e => !e.isOperational).length
        };
    }

    async clear() {
        this.errors = [];

        // Clear database too
        if (this.useDatabase && this.dbReady) {
            try {
                await this.db.clear();
            } catch (error) {
                console.warn('[ErrorLogger] Failed to clear database:', error.message);
            }
        }
    }
}

export const errorLogger = new ErrorLogger();

/**
 * Async error handler wrapper
 */
export function asyncHandler(fn) {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
}

/**
 * Global error handler middleware
 */
export async function errorHandler(err, req, res, next) {
    // Log error (async, but don't wait for it)
    errorLogger.log(err, {
        method: req.method,
        url: req.url,
        body: req.body,
        params: req.params,
        query: req.query
    }).catch(logError => {
        console.error('[ErrorHandler] Failed to log error:', logError.message);
    });

    // Send response immediately
    const statusCode = err.statusCode || 500;
    const message = err.isOperational ? err.message : 'Internal server error';

    res.status(statusCode).json({
        error: {
            message,
            statusCode,
            timestamp: new Date(),
            ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
        }
    });
}

/**
 * Input Validation
 */
export const validate = {
    required(value, fieldName) {
        if (value === null || value === undefined || value === '') {
            throw new ValidationError(`${fieldName} is required`, fieldName);
        }
        return value;
    },

    string(value, fieldName, options = {}) {
        this.required(value, fieldName);

        if (typeof value !== 'string') {
            throw new ValidationError(`${fieldName} must be a string`, fieldName);
        }

        if (options.minLength && value.length < options.minLength) {
            throw new ValidationError(
                `${fieldName} must be at least ${options.minLength} characters`,
                fieldName
            );
        }

        if (options.maxLength && value.length > options.maxLength) {
            throw new ValidationError(
                `${fieldName} must be at most ${options.maxLength} characters`,
                fieldName
            );
        }

        if (options.pattern && !options.pattern.test(value)) {
            throw new ValidationError(
                `${fieldName} format is invalid`,
                fieldName
            );
        }

        return value;
    },

    number(value, fieldName, options = {}) {
        this.required(value, fieldName);

        const num = Number(value);
        if (isNaN(num)) {
            throw new ValidationError(`${fieldName} must be a number`, fieldName);
        }

        if (options.min !== undefined && num < options.min) {
            throw new ValidationError(
                `${fieldName} must be at least ${options.min}`,
                fieldName
            );
        }

        if (options.max !== undefined && num > options.max) {
            throw new ValidationError(
                `${fieldName} must be at most ${options.max}`,
                fieldName
            );
        }

        return num;
    },

    enum(value, fieldName, allowedValues) {
        this.required(value, fieldName);

        if (!allowedValues.includes(value)) {
            throw new ValidationError(
                `${fieldName} must be one of: ${allowedValues.join(', ')}`,
                fieldName
            );
        }

        return value;
    },

    sanitize(input) {
        if (typeof input !== 'string') return input;

        // Remove potential XSS
        return input
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#x27;')
            .replace(/\//g, '&#x2F;');
    }
};

/**
 * Rate Limiter
 */
export class RateLimiter {
    constructor(maxRequests = 100, windowMs = 60000) {
        this.maxRequests = maxRequests;
        this.windowMs = windowMs;
        this.requests = new Map();
    }

    check(identifier) {
        const now = Date.now();
        const userRequests = this.requests.get(identifier) || [];

        // Remove old requests
        const validRequests = userRequests.filter(time => now - time < this.windowMs);

        if (validRequests.length >= this.maxRequests) {
            throw new RateLimitError(`Rate limit exceeded. Max ${this.maxRequests} requests per ${this.windowMs / 1000}s`);
        }

        validRequests.push(now);
        this.requests.set(identifier, validRequests);

        return {
            remaining: this.maxRequests - validRequests.length,
            resetAt: new Date(now + this.windowMs)
        };
    }

    reset(identifier) {
        this.requests.delete(identifier);
    }

    clear() {
        this.requests.clear();
    }
}

const limiterInstance = new RateLimiter();

/**
 * Rate Limiter Middleware
 */
export const rateLimiter = (req, res, next) => {
    try {
        const identifier = req.ip || req.headers['x-forwarded-for'] || 'anonymous';
        limiterInstance.check(identifier);
        next();
    } catch (error) {
        next(error);
    }
};
