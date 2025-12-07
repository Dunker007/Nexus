/**
 * Unit Tests for Performance Service
 * Tests performance monitoring, caching, retry logic, and batch processing
 */

import {
    performanceMonitor,
    cache,
    retry,
    BatchProcessor,
    debounce,
    throttle
} from '../../services/performance.js';

describe('PerformanceMonitor', () => {
    beforeEach(async () => {
        await performanceMonitor.clear();
    });

    describe('track', () => {
        it('should track performance metrics', async () => {
            const metric = await performanceMonitor.track('test-endpoint', 500);

            expect(metric.name).toBe('test-endpoint');
            expect(metric.duration).toBe(500);
            expect(metric.slow).toBe(false);
            expect(metric.timestamp).toBeInstanceOf(Date);
        });

        it('should mark slow requests', async () => {
            const metric = await performanceMonitor.track('slow-endpoint', 1500);
            expect(metric.slow).toBe(true);
        });

        it('should include metadata', async () => {
            const metadata = { method: 'GET', path: '/api/test' };
            const metric = await performanceMonitor.track('test', 100, metadata);

            expect(metric.method).toBe('GET');
            expect(metric.path).toBe('/api/test');
        });

        it('should limit stored metrics', async () => {
            const originalMax = performanceMonitor.maxMetrics;
            performanceMonitor.maxMetrics = 5;

            for (let i = 0; i < 10; i++) {
                await performanceMonitor.track('test', i * 100);
            }

            const stats = await performanceMonitor.getStats('test');
            expect(stats.count).toBe(5);

            performanceMonitor.maxMetrics = originalMax;
        });
    });

    describe('getStats', () => {
        it('should return null for unknown endpoint', async () => {
            const stats = await performanceMonitor.getStats('unknown');
            expect(stats).toBeNull();
        });

        it('should calculate statistics correctly', async () => {
            await performanceMonitor.track('test', 100);
            await performanceMonitor.track('test', 200);
            await performanceMonitor.track('test', 300);
            await performanceMonitor.track('test', 400);
            await performanceMonitor.track('test', 500);

            const stats = await performanceMonitor.getStats('test');

            expect(stats.count).toBe(5);
            expect(stats.avg).toBe(300);
            expect(stats.min).toBe(100);
            expect(stats.max).toBe(500);
            expect(stats.p50).toBe(300);
        });

        it('should count slow requests', async () => {
            await performanceMonitor.track('test', 500);
            await performanceMonitor.track('test', 1500); // Slow
            await performanceMonitor.track('test', 2000); // Slow

            const stats = await performanceMonitor.getStats('test');
            expect(stats.slowRequests).toBe(2);
        });

        it('should include last request', async () => {
            await performanceMonitor.track('test', 100);
            await performanceMonitor.track('test', 200);

            const stats = await performanceMonitor.getStats('test');
            expect(stats.lastRequest.duration).toBe(200);
        });
    });

    describe('getAllStats', () => {
        it('should return stats for all endpoints', async () => {
            await performanceMonitor.track('endpoint1', 100);
            await performanceMonitor.track('endpoint2', 200);

            const allStats = await performanceMonitor.getAllStats();

            expect(allStats.endpoint1).toBeDefined();
            expect(allStats.endpoint2).toBeDefined();
            expect(allStats.endpoint1.count).toBe(1);
            expect(allStats.endpoint2.count).toBe(1);
        });

        it('should return empty object when no metrics', async () => {
            const allStats = await performanceMonitor.getAllStats();
            expect(allStats).toEqual({});
        });
    });

    describe('clear', () => {
        it('should clear all metrics', async () => {
            await performanceMonitor.track('test', 100);
            await performanceMonitor.clear();

            const stats = await performanceMonitor.getStats('test');
            expect(stats).toBeNull();
        });
    });
});

describe('Cache', () => {
    beforeEach(() => {
        cache.clear();
    });

    describe('set and get', () => {
        it('should store and retrieve values', () => {
            cache.set('key1', 'value1');
            expect(cache.get('key1')).toBe('value1');
        });

        it('should return null for missing keys', () => {
            expect(cache.get('nonexistent')).toBeNull();
        });

        it('should handle different data types', () => {
            cache.set('string', 'hello');
            cache.set('number', 42);
            cache.set('object', { foo: 'bar' });
            cache.set('array', [1, 2, 3]);

            expect(cache.get('string')).toBe('hello');
            expect(cache.get('number')).toBe(42);
            expect(cache.get('object')).toEqual({ foo: 'bar' });
            expect(cache.get('array')).toEqual([1, 2, 3]);
        });
    });

    describe('TTL (Time To Live)', () => {
        it('should expire items after TTL', async () => {
            const shortCache = new (cache.constructor)(100); // 100ms TTL
            shortCache.set('key', 'value');

            expect(shortCache.get('key')).toBe('value');

            await new Promise(resolve => setTimeout(resolve, 150));

            expect(shortCache.get('key')).toBeNull();
        });

        it('should support custom TTL per item', async () => {
            cache.set('short', 'value', 100); // 100ms
            cache.set('long', 'value', 10000); // 10s

            await new Promise(resolve => setTimeout(resolve, 150));

            expect(cache.get('short')).toBeNull();
            expect(cache.get('long')).toBe('value');
        });
    });

    describe('has', () => {
        it('should return true for existing keys', () => {
            cache.set('key', 'value');
            expect(cache.has('key')).toBe(true);
        });

        it('should return false for missing keys', () => {
            expect(cache.has('nonexistent')).toBe(false);
        });

        it('should return false for expired keys', async () => {
            const shortCache = new (cache.constructor)(100);
            shortCache.set('key', 'value');

            await new Promise(resolve => setTimeout(resolve, 150));

            expect(shortCache.has('key')).toBe(false);
        });
    });

    describe('delete', () => {
        it('should delete keys', () => {
            cache.set('key', 'value');
            cache.delete('key');
            expect(cache.get('key')).toBeNull();
        });
    });

    describe('clear', () => {
        it('should clear all entries', () => {
            cache.set('key1', 'value1');
            cache.set('key2', 'value2');
            cache.clear();

            expect(cache.get('key1')).toBeNull();
            expect(cache.get('key2')).toBeNull();
        });
    });

    describe('size', () => {
        it('should return number of valid entries', () => {
            cache.set('key1', 'value1');
            cache.set('key2', 'value2');

            expect(cache.size()).toBe(2);
        });

        it('should exclude expired entries', async () => {
            const shortCache = new (cache.constructor)(100);
            shortCache.set('key1', 'value1');
            shortCache.set('key2', 'value2');

            await new Promise(resolve => setTimeout(resolve, 150));

            expect(shortCache.size()).toBe(0);
        });
    });

    describe('getStats', () => {
        it('should return cache statistics', () => {
            cache.set('key1', 'value1');
            cache.set('key2', 'value2');

            const stats = cache.getStats();

            expect(stats.total).toBe(2);
            expect(stats.valid).toBe(2);
            expect(stats.expired).toBe(0);
            expect(stats.ttl).toBeDefined();
        });

        it('should count expired entries', async () => {
            const shortCache = new (cache.constructor)(100);
            shortCache.set('key1', 'value1');
            shortCache.set('key2', 'value2');

            await new Promise(resolve => setTimeout(resolve, 150));

            const stats = shortCache.getStats();
            expect(stats.expired).toBe(2);
            expect(stats.valid).toBe(0);
        });
    });
});

describe('retry', () => {
    it('should succeed on first attempt', async () => {
        let callCount = 0;
        const fn = async () => {
            callCount++;
            return 'success';
        };

        const result = await retry(fn);

        expect(result).toBe('success');
        expect(callCount).toBe(1);
    });

    it('should retry on failure', async () => {
        let callCount = 0;
        const fn = async () => {
            callCount++;
            if (callCount < 3) {
                throw new Error(`fail ${callCount}`);
            }
            return 'success';
        };

        const result = await retry(fn, { delay: 10 });

        expect(result).toBe('success');
        expect(callCount).toBe(3);
    });

    it('should throw after max attempts', async () => {
        let callCount = 0;
        const fn = async () => {
            callCount++;
            throw new Error('always fails');
        };

        await expect(retry(fn, { maxAttempts: 3, delay: 10 })).rejects.toThrow('always fails');
        expect(callCount).toBe(3);
    });

    it('should use exponential backoff', async () => {
        let callCount = 0;
        const fn = async () => {
            callCount++;
            if (callCount < 3) {
                throw new Error(`fail ${callCount}`);
            }
            return 'success';
        };

        const delays = [];
        await retry(fn, {
            delay: 100,
            backoff: 2,
            onRetry: (attempt, waitTime) => delays.push(waitTime)
        });

        expect(delays).toEqual([100, 200]); // 100 * 2^0, 100 * 2^1
    });

    it('should call onRetry callback', async () => {
        let callCount = 0;
        let retryCallCount = 0;
        let lastError = null;

        const fn = async () => {
            callCount++;
            if (callCount < 2) {
                throw new Error('fail');
            }
            return 'success';
        };

        const onRetry = (attempt, waitTime, error) => {
            retryCallCount++;
            lastError = error;
        };

        await retry(fn, { delay: 10, onRetry });

        expect(retryCallCount).toBe(1);
        expect(lastError).toBeInstanceOf(Error);
    });
});

describe('BatchProcessor', () => {
    it.skip('should process items in batches', async () => {
        const processedBatches = [];
        const processFn = async (items) => {
            processedBatches.push(items);
            return items.map(x => x * 2);
        };

        const processor = new BatchProcessor(processFn, { batchSize: 3, delay: 10 });

        const results = await Promise.all([
            processor.add(1),
            processor.add(2),
            processor.add(3),
            processor.add(4),
            processor.add(5)
        ]);

        expect(results).toEqual([2, 4, 6, 8, 10]);
        expect(processedBatches.length).toBe(2); // 2 batches (3 + 2 items)
    });

    it('should handle processing errors', async () => {
        const processFn = async () => {
            throw new Error('processing failed');
        };
        const processor = new BatchProcessor(processFn, { batchSize: 2 });

        await expect(processor.add(1)).rejects.toThrow('processing failed');
    });

    it.skip('should respect batch size', async () => {
        const processedBatches = [];
        const processFn = async (items) => {
            processedBatches.push([...items]);
            return items;
        };

        const processor = new BatchProcessor(processFn, { batchSize: 2, delay: 10 });

        await Promise.all([
            processor.add(1),
            processor.add(2),
            processor.add(3)
        ]);

        // Wait a bit to ensure all batches are processed
        await new Promise(resolve => setTimeout(resolve, 100));

        expect(processedBatches.length).toBe(2);
        expect(processedBatches[0]).toEqual([1, 2]);
        expect(processedBatches[1]).toEqual([3]);
    });
});

describe('debounce', () => {
    it('should debounce function calls', async () => {
        let callCount = 0;
        let lastValue = null;

        const fn = (x) => {
            callCount++;
            lastValue = x;
            return x * 2;
        };

        const debounced = debounce(fn, 100);

        debounced(1);
        debounced(2);
        debounced(3);

        await new Promise(resolve => setTimeout(resolve, 150));

        expect(callCount).toBe(1);
        expect(lastValue).toBe(3); // Only last call
    });

    it('should return a promise', async () => {
        const fn = (x) => x * 2;
        const debounced = debounce(fn, 50);

        const result = await debounced(5);

        expect(result).toBe(10);
    });
});

describe('throttle', () => {
    it('should throttle function calls', async () => {
        let callCount = 0;
        const fn = () => {
            callCount++;
        };

        const throttled = throttle(fn, 100);

        throttled();
        throttled();
        throttled();

        expect(callCount).toBe(1); // Only first call

        await new Promise(resolve => setTimeout(resolve, 150));

        throttled();
        expect(callCount).toBe(2); // After throttle period
    });

    it('should preserve function arguments', () => {
        let lastArgs = null;
        const fn = (...args) => {
            lastArgs = args;
        };

        const throttled = throttle(fn, 100);

        throttled(1, 2, 3);

        expect(lastArgs).toEqual([1, 2, 3]);
    });
});
