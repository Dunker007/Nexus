/**
 * Database Service
 * Prisma client wrapper with helper functions
 */

import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory for relative database path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, '../prisma/dev.db');

// Initialize Prisma Client with SQLite adapter
let prismaInstance;
try {
    const sqlite = new Database(dbPath);
    const adapter = new PrismaBetterSqlite3(sqlite);
    prismaInstance = new PrismaClient({ adapter });
    console.log('✅ Prisma Client initialized with SQLite adapter');
} catch (e) {
    console.error('Failed to initialize Prisma Client, falling back to mock:', e.message);
    // Create a proxy that swallows all calls or simple mock
    const mockHandler = {
        get: (target, prop) => {
            if (prop === '$disconnect') return async () => { };
            // Return a function that returns null/empty array for any query
            return () => Promise.resolve([]);
        }
    };
    prismaInstance = new Proxy({}, {
        get: (target, prop) => {
            if (prop === '$disconnect') return async () => { };
            return new Proxy({}, mockHandler);
        }
    });
}

const prisma = prismaInstance;

// Graceful shutdown
process.on('beforeExit', async () => {
    try {
        await prisma.$disconnect();
    } catch { }
});

export { prisma };

/**
 * Database Helper Functions
 */

// Error Logging
export const errorLog = {
    async create(error, context = {}) {
        return await prisma.errorLog.create({
            data: {
                type: error.constructor.name,
                message: error.message,
                stack: error.stack,
                statusCode: error.statusCode || 500,
                isOperational: error.isOperational !== false,
                method: context.method,
                url: context.url,
                body: context.body ? JSON.stringify(context.body) : null,
                params: context.params ? JSON.stringify(context.params) : null,
                query: context.query ? JSON.stringify(context.query) : null,
                metadata: context.metadata ? JSON.stringify(context.metadata) : null,
            },
        });
    },

    async getRecent(limit = 100) {
        return await prisma.errorLog.findMany({
            take: limit,
            orderBy: { timestamp: 'desc' },
        });
    },

    async getStats() {
        const now = new Date();
        const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        const lastHour = new Date(now.getTime() - 60 * 60 * 1000);

        const [total, last24Hours, lastHourCount, operational, critical] = await Promise.all([
            prisma.errorLog.count(),
            prisma.errorLog.count({ where: { timestamp: { gte: last24h } } }),
            prisma.errorLog.count({ where: { timestamp: { gte: lastHour } } }),
            prisma.errorLog.count({ where: { isOperational: true } }),
            prisma.errorLog.count({ where: { isOperational: false } }),
        ]);

        return {
            total,
            last24Hours,
            lastHour: lastHourCount,
            operational,
            critical,
        };
    },

    async clear() {
        return await prisma.errorLog.deleteMany();
    },
};

// Agent Memory
export const agentMemory = {
    async set(agentType, key, value) {
        return await prisma.agentMemory.upsert({
            where: {
                agentType_key: { agentType, key },
            },
            update: {
                value: JSON.stringify(value),
            },
            create: {
                agentType,
                key,
                value: JSON.stringify(value),
            },
        });
    },

    async get(agentType, key) {
        const memory = await prisma.agentMemory.findUnique({
            where: {
                agentType_key: { agentType, key },
            },
        });
        return memory ? JSON.parse(memory.value) : null;
    },

    async getAll(agentType) {
        const memories = await prisma.agentMemory.findMany({
            where: { agentType },
        });
        return memories.reduce((acc, m) => {
            acc[m.key] = JSON.parse(m.value);
            return acc;
        }, {});
    },

    async delete(agentType, key) {
        return await prisma.agentMemory.delete({
            where: {
                agentType_key: { agentType, key },
            },
        });
    },

    async clear(agentType) {
        return await prisma.agentMemory.deleteMany({
            where: { agentType },
        });
    },
};

// Performance Metrics
export const performanceMetrics = {
    async track(name, duration, metadata = {}) {
        return await prisma.performanceMetric.create({
            data: {
                name,
                duration,
                slow: duration > 1000,
                method: metadata.method,
                path: metadata.path,
                statusCode: metadata.statusCode,
                metadata: metadata.metadata ? JSON.stringify(metadata.metadata) : null,
            },
        });
    },

    async getStats(name) {
        const metrics = await prisma.performanceMetric.findMany({
            where: { name },
            orderBy: { timestamp: 'desc' },
            take: 1000,
        });

        if (metrics.length === 0) return null;

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
            lastRequest: metrics[0],
        };
    },

    async getAllStats() {
        const allMetrics = await prisma.performanceMetric.findMany({
            select: { name: true },
            distinct: ['name'],
        });

        const stats = {};
        for (const { name } of allMetrics) {
            stats[name] = await this.getStats(name);
        }
        return stats;
    },

    async clear() {
        return await prisma.performanceMetric.deleteMany();
    },
};

// Cache
export const dbCache = {
    async set(key, value, ttlMs = 60000) {
        const expiresAt = new Date(Date.now() + ttlMs);
        return await prisma.cacheEntry.upsert({
            where: { key },
            update: {
                value: JSON.stringify(value),
                expiresAt,
            },
            create: {
                key,
                value: JSON.stringify(value),
                expiresAt,
            },
        });
    },

    async get(key) {
        const entry = await prisma.cacheEntry.findUnique({
            where: { key },
        });

        if (!entry) return null;

        if (new Date() > entry.expiresAt) {
            await prisma.cacheEntry.delete({ where: { key } });
            return null;
        }

        return JSON.parse(entry.value);
    },

    async delete(key) {
        return await prisma.cacheEntry.delete({ where: { key } });
    },

    async clear() {
        return await prisma.cacheEntry.deleteMany();
    },

    async clearExpired() {
        return await prisma.cacheEntry.deleteMany({
            where: {
                expiresAt: { lt: new Date() },
            },
        });
    },
};

// Agent Tasks
export const agentTasks = {
    async create(agentType, task, metadata = {}) {
        return await prisma.agentTask.create({
            data: {
                agentType,
                task,
                status: 'pending',
                metadata: JSON.stringify(metadata),
            },
        });
    },

    async updateStatus(id, status, result = null, error = null) {
        const data = {
            status,
            result: result ? JSON.stringify(result) : null,
            error,
        };

        if (status === 'completed' || status === 'failed') {
            const task = await prisma.agentTask.findUnique({ where: { id } });
            if (task) {
                data.completedAt = new Date();
                data.duration = Date.now() - task.startedAt.getTime();
            }
        }

        return await prisma.agentTask.update({
            where: { id },
            data,
        });
    },

    async getRecent(agentType = null, limit = 100) {
        return await prisma.agentTask.findMany({
            where: agentType ? { agentType } : undefined,
            take: limit,
            orderBy: { startedAt: 'desc' },
        });
    },

    async getStats(agentType = null) {
        const where = agentType ? { agentType } : undefined;

        const [total, pending, running, completed, failed] = await Promise.all([
            prisma.agentTask.count({ where }),
            prisma.agentTask.count({ where: { ...where, status: 'pending' } }),
            prisma.agentTask.count({ where: { ...where, status: 'running' } }),
            prisma.agentTask.count({ where: { ...where, status: 'completed' } }),
            prisma.agentTask.count({ where: { ...where, status: 'failed' } }),
        ]);

        return {
            total,
            pending,
            running,
            completed,
            failed,
            successRate: total > 0 ? (completed / total) * 100 : 0,
        };
    },
};

// LLM Usage Tracking
export const llmUsage = {
    async track(provider, model, operation, data = {}) {
        return await prisma.lLMUsage.create({
            data: {
                provider,
                model,
                operation,
                promptTokens: data.promptTokens,
                completionTokens: data.completionTokens,
                totalTokens: data.totalTokens,
                duration: data.duration,
                cost: data.cost,
                metadata: data.metadata ? JSON.stringify(data.metadata) : null,
            },
        });
    },

    async getStats(provider = null, model = null) {
        const where = {};
        if (provider) where.provider = provider;
        if (model) where.model = model;

        const usage = await prisma.lLMUsage.findMany({ where });

        const totalTokens = usage.reduce((sum, u) => sum + (u.totalTokens || 0), 0);
        const totalCost = usage.reduce((sum, u) => sum + (u.cost || 0), 0);
        const avgDuration = usage.length > 0
            ? usage.reduce((sum, u) => sum + u.duration, 0) / usage.length
            : 0;

        return {
            count: usage.length,
            totalTokens,
            totalCost,
            avgDuration,
        };
    },
};

export default prisma;
