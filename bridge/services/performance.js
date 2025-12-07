/**
 * Performance Monitor with Database Persistence
 */
class PerformanceMonitor {
    constructor() {
        this.metrics = new Map(); // In-memory cache for fast access
        this.slowThreshold = 1000; // 1 second
        this.maxMetrics = 1000;
        this.useDatabase = true;
        this.dbReady = false;

        // Initialize database connection
        this.initDatabase();
    }

    async initDatabase() {
        try {
            const { performanceMetrics } = await import('./database.js');
            this.db = performanceMetrics;
            this.dbReady = true;
        } catch (error) {
            console.warn('[PerformanceMonitor] Database not available, using in-memory only:', error.message);
            this.useDatabase = false;
        }
    }

    /**
     * Track request performance
     */
    async track(name, duration, metadata = {}) {
        const metric = {
            name,
            duration,
            timestamp: new Date(),
            slow: duration > this.slowThreshold,
            ...metadata
        };

        // Add to in-memory cache
        if (!this.metrics.has(name)) {
            this.metrics.set(name, []);
        }

        const metrics = this.metrics.get(name);
        metrics.push(metric);

        // Keep only last maxMetrics in memory
        if (metrics.length > this.maxMetrics) {
            this.metrics.set(name, metrics.slice(-this.maxMetrics));
        }

        // Persist to database (async, non-blocking)
        if (this.useDatabase && this.dbReady) {
            try {
                await this.db.track(name, duration, metadata);
            } catch (dbError) {
                console.warn('[PerformanceMonitor] Failed to persist to database:', dbError.message);
            }
        }

        return metric;
    }

    /**
     * Get performance stats for an endpoint
     */
    async getStats(name) {
        // Try to get from database first
        if (this.useDatabase && this.dbReady) {
            try {
                return await this.db.getStats(name);
            } catch (error) {
                console.warn('[PerformanceMonitor] Failed to get stats from database:', error.message);
            }
        }

        // Fallback to in-memory calculation
        const metrics = this.metrics.get(name) || [];
        if (metrics.length === 0) {
            return null;
        }

        const durations = metrics.map(m => m.duration);
        const sorted = [...durations].sort((a, b) => a - b);

        return {
            name,
            count: metrics.length,
            avg: durations.reduce((a, b) => a + b, 0) / durations.length,
            min: Math.min(...durations),
            max: Math.max(...durations),
            p50: sorted[Math.floor(sorted.length * 0.5)],
            p95: sorted[Math.floor(sorted.length * 0.95)],
            p99: sorted[Math.floor(sorted.length * 0.99)],
            slowRequests: metrics.filter(m => m.slow).length,
            lastRequest: metrics[metrics.length - 1]
        };
    }

    /**
     * Get all performance stats
     */
    async getAllStats() {
        // Try to get from database first
        if (this.useDatabase && this.dbReady) {
            try {
                return await this.db.getAllStats();
            } catch (error) {
                console.warn('[PerformanceMonitor] Failed to get all stats from database:', error.message);
            }
        }

        // Fallback to in-memory calculation
        const stats = {};
        for (const [name] of this.metrics) {
            stats[name] = await this.getStats(name);
        }
        return stats;
    }

    /**
     * Middleware to track request performance
     */
    middleware() {
        return (req, res, next) => {
            const start = Date.now();
            const originalSend = res.send;

            res.send = function (data) {
                const duration = Date.now() - start;
                // Fire and forget - don't wait for database
                performanceMonitor.track(`${req.method} ${req.path}`, duration, {
                    method: req.method,
                    path: req.path,
                    statusCode: res.statusCode
                }).catch(err => {
                    console.warn('[PerformanceMonitor] Failed to track metric:', err.message);
                });
                originalSend.call(this, data);
            };

            next();
        };
    }

    async clear() {
        this.metrics.clear();

        // Clear database too
        if (this.useDatabase && this.dbReady) {
            try {
                await this.db.clear();
            } catch (error) {
                console.warn('[PerformanceMonitor] Failed to clear database:', error.message);
            }
        }
    }
}

export const performanceMonitor = new PerformanceMonitor();

/**
 * Simple in-memory cache
 */
class Cache {
    constructor(ttl = 60000) { // Default 1 minute
        this.cache = new Map();
        this.ttl = ttl;
    }

    set(key, value, customTtl = null) {
        const expiresAt = Date.now() + (customTtl || this.ttl);
        this.cache.set(key, { value, expiresAt });
    }

    get(key) {
        const item = this.cache.get(key);
        if (!item) return null;

        if (Date.now() > item.expiresAt) {
            this.cache.delete(key);
            return null;
        }

        return item.value;
    }

    has(key) {
        return this.get(key) !== null;
    }

    delete(key) {
        this.cache.delete(key);
    }

    clear() {
        this.cache.clear();
    }

    size() {
        // Clean expired entries first
        for (const [key, item] of this.cache.entries()) {
            if (Date.now() > item.expiresAt) {
                this.cache.delete(key);
            }
        }
        return this.cache.size;
    }

    getStats() {
        const now = Date.now();
        let expired = 0;
        let valid = 0;

        for (const [, item] of this.cache.entries()) {
            if (now > item.expiresAt) {
                expired++;
            } else {
                valid++;
            }
        }

        return {
            total: this.cache.size,
            valid,
            expired,
            ttl: this.ttl
        };
    }
}

export const cache = new Cache();

/**
 * Async retry with exponential backoff
 */
export async function retry(fn, options = {}) {
    const {
        maxAttempts = 3,
        delay = 1000,
        backoff = 2,
        onRetry = null
    } = options;

    let lastError;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error;

            if (attempt === maxAttempts) {
                throw error;
            }

            const waitTime = delay * Math.pow(backoff, attempt - 1);

            if (onRetry) {
                onRetry(attempt, waitTime, error);
            }

            await new Promise(resolve => setTimeout(resolve, waitTime));
        }
    }

    throw lastError;
}

/**
 * Batch processor for efficient bulk operations
 */
export class BatchProcessor {
    constructor(processFn, options = {}) {
        this.processFn = processFn;
        this.batchSize = options.batchSize || 10;
        this.delay = options.delay || 100;
        this.queue = [];
        this.processing = false;
    }

    async add(item) {
        return new Promise((resolve, reject) => {
            this.queue.push({ item, resolve, reject });
            this.process();
        });
    }

    async process() {
        if (this.processing || this.queue.length === 0) {
            return;
        }

        this.processing = true;

        while (this.queue.length > 0) {
            const batch = this.queue.splice(0, this.batchSize);

            try {
                const items = batch.map(b => b.item);
                const results = await this.processFn(items);

                batch.forEach((b, i) => {
                    b.resolve(results[i]);
                });
            } catch (error) {
                batch.forEach(b => b.reject(error));
            }

            if (this.queue.length > 0) {
                await new Promise(resolve => setTimeout(resolve, this.delay));
            }
        }

        this.processing = false;
    }
}

/**
 * Debounce function calls
 */
export function debounce(fn, delay = 300) {
    let timeoutId;

    return function (...args) {
        clearTimeout(timeoutId);

        return new Promise((resolve) => {
            timeoutId = setTimeout(() => {
                resolve(fn.apply(this, args));
            }, delay);
        });
    };
}

/**
 * Throttle function calls
 */
export function throttle(fn, limit = 1000) {
    let inThrottle;

    return function (...args) {
        if (!inThrottle) {
            fn.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}
