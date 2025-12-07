
import { jest } from '@jest/globals';

// Mock Prisma Client
const mockPrisma = {
    errorLog: {
        create: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
        deleteMany: jest.fn()
    },
    agentMemory: {
        upsert: jest.fn(),
        findUnique: jest.fn(),
        findMany: jest.fn(),
        delete: jest.fn(),
        deleteMany: jest.fn()
    },
    performanceMetric: {
        create: jest.fn(),
        findMany: jest.fn(),
        deleteMany: jest.fn()
    },
    cacheEntry: {
        upsert: jest.fn(),
        findUnique: jest.fn(),
        delete: jest.fn(),
        deleteMany: jest.fn()
    },
    $disconnect: jest.fn()
};

// Mock the module using unstable_mockModule for ESM support
jest.unstable_mockModule('@prisma/client', () => ({
    PrismaClient: jest.fn(() => mockPrisma)
}));

// Import the module under test dynamically AFTER mocking
const { errorLog, agentMemory, performanceMetrics } = await import('../../services/database.js');
const { PrismaClient } = await import('@prisma/client');

describe('Database Service', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Error Log', () => {
        test('should create error log', async () => {
            const error = new Error('Test error');
            mockPrisma.errorLog.create.mockResolvedValue({ id: '1', message: 'Test error' });

            await errorLog.create(error);

            expect(mockPrisma.errorLog.create).toHaveBeenCalledWith(expect.objectContaining({
                data: expect.objectContaining({
                    message: 'Test error',
                    type: 'Error'
                })
            }));
        });

        test('should get stats', async () => {
            mockPrisma.errorLog.count.mockResolvedValue(5);

            const stats = await errorLog.getStats();

            expect(stats.total).toBe(5);
            expect(mockPrisma.errorLog.count).toHaveBeenCalledTimes(5);
        });
    });

    describe('Agent Memory', () => {
        test('should set memory', async () => {
            mockPrisma.agentMemory.upsert.mockResolvedValue({ id: '1' });

            await agentMemory.set('test-agent', 'key', { value: 1 });

            expect(mockPrisma.agentMemory.upsert).toHaveBeenCalledWith(expect.objectContaining({
                where: { agentType_key: { agentType: 'test-agent', key: 'key' } },
                create: expect.objectContaining({
                    value: JSON.stringify({ value: 1 })
                })
            }));
        });

        test('should get memory', async () => {
            mockPrisma.agentMemory.findUnique.mockResolvedValue({
                value: JSON.stringify({ value: 1 })
            });

            const result = await agentMemory.get('test-agent', 'key');

            expect(result).toEqual({ value: 1 });
        });

        test('should return null for missing memory', async () => {
            mockPrisma.agentMemory.findUnique.mockResolvedValue(null);

            const result = await agentMemory.get('test-agent', 'missing');

            expect(result).toBeNull();
        });
    });

    describe('Performance Metrics', () => {
        test('should track metric', async () => {
            mockPrisma.performanceMetric.create.mockResolvedValue({ id: '1' });

            await performanceMetrics.track('api-call', 100);

            expect(mockPrisma.performanceMetric.create).toHaveBeenCalledWith(expect.objectContaining({
                data: expect.objectContaining({
                    name: 'api-call',
                    duration: 100,
                    slow: false
                })
            }));
        });

        test('should mark slow requests', async () => {
            mockPrisma.performanceMetric.create.mockResolvedValue({ id: '1' });

            await performanceMetrics.track('slow-call', 2000);

            expect(mockPrisma.performanceMetric.create).toHaveBeenCalledWith(expect.objectContaining({
                data: expect.objectContaining({
                    slow: true
                })
            }));
        });
    });
});

