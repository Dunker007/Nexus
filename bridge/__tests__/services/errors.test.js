/**
 * Unit Tests for Error Handling Service
 * Tests custom error classes, validation, rate limiting, and error logging
 */

import {
    AppError,
    ValidationError,
    AuthenticationError,
    AuthorizationError,
    NotFoundError,
    RateLimitError,
    errorLogger,
    validate,
    RateLimiter
} from '../../services/errors.js';

describe('Error Classes', () => {
    describe('AppError', () => {
        it('should create error with default values', () => {
            const error = new AppError('Test error');
            expect(error.message).toBe('Test error');
            expect(error.statusCode).toBe(500);
            expect(error.isOperational).toBe(true);
            expect(error.timestamp).toBeInstanceOf(Date);
        });

        it('should create error with custom status code', () => {
            const error = new AppError('Test error', 404);
            expect(error.statusCode).toBe(404);
        });

        it('should create non-operational error', () => {
            const error = new AppError('Test error', 500, false);
            expect(error.isOperational).toBe(false);
        });
    });

    describe('ValidationError', () => {
        it('should create validation error with field', () => {
            const error = new ValidationError('Invalid email', 'email');
            expect(error.message).toBe('Invalid email');
            expect(error.statusCode).toBe(400);
            expect(error.field).toBe('email');
        });

        it('should create validation error without field', () => {
            const error = new ValidationError('Invalid input');
            expect(error.field).toBe(null);
        });
    });

    describe('AuthenticationError', () => {
        it('should create auth error with default message', () => {
            const error = new AuthenticationError();
            expect(error.message).toBe('Authentication required');
            expect(error.statusCode).toBe(401);
        });

        it('should create auth error with custom message', () => {
            const error = new AuthenticationError('Invalid token');
            expect(error.message).toBe('Invalid token');
        });
    });

    describe('AuthorizationError', () => {
        it('should create authorization error', () => {
            const error = new AuthorizationError();
            expect(error.message).toBe('Insufficient permissions');
            expect(error.statusCode).toBe(403);
        });
    });

    describe('NotFoundError', () => {
        it('should create not found error with default resource', () => {
            const error = new NotFoundError();
            expect(error.message).toBe('Resource not found');
            expect(error.statusCode).toBe(404);
        });

        it('should create not found error with custom resource', () => {
            const error = new NotFoundError('User');
            expect(error.message).toBe('User not found');
        });
    });

    describe('RateLimitError', () => {
        it('should create rate limit error', () => {
            const error = new RateLimitError();
            expect(error.message).toBe('Too many requests');
            expect(error.statusCode).toBe(429);
        });
    });
});

describe('ErrorLogger', () => {
    beforeEach(async () => {
        await errorLogger.clear();
    });

    it('should log errors', async () => {
        const error = new AppError('Test error');
        const log = await errorLogger.log(error);

        expect(log.message).toBe('Test error');
        expect(log.statusCode).toBe(500);
        expect(log.isOperational).toBe(true);
        expect(log.timestamp).toBeInstanceOf(Date);
    });

    it('should log errors with context', async () => {
        const error = new AppError('Test error');
        const context = { userId: '123', action: 'test' };
        const log = await errorLogger.log(error, context);

        expect(log.context).toEqual(context);
    });

    it('should retrieve errors with limit', async () => {
        for (let i = 0; i < 10; i++) {
            await errorLogger.log(new AppError(`Error ${i}`));
        }

        const errors = await errorLogger.getErrors(5);
        expect(errors.length).toBe(5);
        expect(errors[4].message).toBe('Error 9'); // Last 5 errors
    });

    it('should limit stored errors to maxErrors', async () => {
        const originalMax = errorLogger.maxErrors;
        errorLogger.maxErrors = 5;

        for (let i = 0; i < 10; i++) {
            await errorLogger.log(new AppError(`Error ${i}`));
        }

        const errors = await errorLogger.getErrors(100);
        expect(errors.length).toBe(5);
        expect(errors[0].message).toBe('Error 5'); // First of last 5

        errorLogger.maxErrors = originalMax;
    });

    it('should calculate error stats', async () => {
        const now = Date.now();

        // Add some errors
        await errorLogger.log(new AppError('Error 1'));
        await errorLogger.log(new AppError('Error 2', 500, false)); // Critical
        await errorLogger.log(new AppError('Error 3'));

        const stats = await errorLogger.getErrorStats();
        expect(stats.total).toBe(3);
        expect(stats.operational).toBe(2);
        expect(stats.critical).toBe(1);
    });

    it('should clear all errors', async () => {
        await errorLogger.log(new AppError('Error 1'));
        await errorLogger.log(new AppError('Error 2'));

        await errorLogger.clear();

        const errors = await errorLogger.getErrors();
        expect(errors.length).toBe(0);
    });
});

describe('Validation', () => {
    describe('required', () => {
        it('should pass for valid values', () => {
            expect(validate.required('test', 'field')).toBe('test');
            expect(validate.required(0, 'field')).toBe(0);
            expect(validate.required(false, 'field')).toBe(false);
        });

        it('should throw for null/undefined/empty', () => {
            expect(() => validate.required(null, 'field')).toThrow(ValidationError);
            expect(() => validate.required(undefined, 'field')).toThrow(ValidationError);
            expect(() => validate.required('', 'field')).toThrow(ValidationError);
        });
    });

    describe('string', () => {
        it('should validate string type', () => {
            expect(validate.string('test', 'field')).toBe('test');
        });

        it('should throw for non-string', () => {
            expect(() => validate.string(123, 'field')).toThrow(ValidationError);
        });

        it('should validate minLength', () => {
            expect(validate.string('hello', 'field', { minLength: 3 })).toBe('hello');
            expect(() => validate.string('hi', 'field', { minLength: 3 })).toThrow(ValidationError);
        });

        it('should validate maxLength', () => {
            expect(validate.string('hi', 'field', { maxLength: 5 })).toBe('hi');
            expect(() => validate.string('toolong', 'field', { maxLength: 5 })).toThrow(ValidationError);
        });

        it('should validate pattern', () => {
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            expect(validate.string('test@example.com', 'email', { pattern: emailPattern })).toBe('test@example.com');
            expect(() => validate.string('invalid', 'email', { pattern: emailPattern })).toThrow(ValidationError);
        });
    });

    describe('number', () => {
        it('should validate number type', () => {
            expect(validate.number(123, 'field')).toBe(123);
            expect(validate.number('123', 'field')).toBe(123); // String to number
        });

        it('should throw for non-number', () => {
            expect(() => validate.number('abc', 'field')).toThrow(ValidationError);
        });

        it('should validate min', () => {
            expect(validate.number(10, 'field', { min: 5 })).toBe(10);
            expect(() => validate.number(3, 'field', { min: 5 })).toThrow(ValidationError);
        });

        it('should validate max', () => {
            expect(validate.number(5, 'field', { max: 10 })).toBe(5);
            expect(() => validate.number(15, 'field', { max: 10 })).toThrow(ValidationError);
        });
    });

    describe('enum', () => {
        it('should validate allowed values', () => {
            const allowed = ['red', 'green', 'blue'];
            expect(validate.enum('red', 'color', allowed)).toBe('red');
        });

        it('should throw for disallowed values', () => {
            const allowed = ['red', 'green', 'blue'];
            expect(() => validate.enum('yellow', 'color', allowed)).toThrow(ValidationError);
        });
    });

    describe('sanitize', () => {
        it('should sanitize HTML characters', () => {
            const input = '<script>alert("xss")</script>';
            const output = validate.sanitize(input);
            expect(output).not.toContain('<');
            expect(output).not.toContain('>');
            expect(output).toContain('&lt;');
            expect(output).toContain('&gt;');
        });

        it('should sanitize quotes and slashes', () => {
            const input = '"/test/';
            const output = validate.sanitize(input);
            expect(output).toBe('&quot;&#x2F;test&#x2F;');
        });

        it('should return non-string values unchanged', () => {
            expect(validate.sanitize(123)).toBe(123);
            expect(validate.sanitize(null)).toBe(null);
        });
    });
});

describe('RateLimiter', () => {
    let limiter;

    beforeEach(() => {
        limiter = new RateLimiter(3, 1000); // 3 requests per second
    });

    it('should allow requests within limit', () => {
        const result1 = limiter.check('user1');
        expect(result1.remaining).toBe(2);

        const result2 = limiter.check('user1');
        expect(result2.remaining).toBe(1);

        const result3 = limiter.check('user1');
        expect(result3.remaining).toBe(0);
    });

    it('should throw when limit exceeded', () => {
        limiter.check('user1');
        limiter.check('user1');
        limiter.check('user1');

        expect(() => limiter.check('user1')).toThrow(RateLimitError);
    });

    it('should track different identifiers separately', () => {
        limiter.check('user1');
        limiter.check('user1');
        limiter.check('user1');

        // user2 should still have full quota
        const result = limiter.check('user2');
        expect(result.remaining).toBe(2);
    });

    it('should reset requests after window', async () => {
        limiter.check('user1');
        limiter.check('user1');
        limiter.check('user1');

        // Wait for window to expire
        await new Promise(resolve => setTimeout(resolve, 1100));

        // Should be able to make requests again
        const result = limiter.check('user1');
        expect(result.remaining).toBe(2);
    });

    it('should reset specific identifier', () => {
        limiter.check('user1');
        limiter.check('user1');

        limiter.reset('user1');

        const result = limiter.check('user1');
        expect(result.remaining).toBe(2);
    });

    it('should clear all identifiers', () => {
        limiter.check('user1');
        limiter.check('user2');

        limiter.clear();

        const result1 = limiter.check('user1');
        const result2 = limiter.check('user2');
        expect(result1.remaining).toBe(2);
        expect(result2.remaining).toBe(2);
    });

    it('should provide resetAt timestamp', () => {
        const result = limiter.check('user1');
        expect(result.resetAt).toBeInstanceOf(Date);
        expect(result.resetAt.getTime()).toBeGreaterThan(Date.now());
    });
});
