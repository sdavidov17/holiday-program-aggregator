/**
 * Security Test: Rate Limiting
 * Tests that rate limiting properly prevents brute force attacks
 */

import { createMocks } from 'node-mocks-http';
import signupHandler from '../../pages/api/auth/signup';
import { authRateLimit } from '../../lib/rate-limiter';

// Mock the database
jest.mock('~/server/db', () => ({
  db: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  },
}));

// Mock the encryption utility
jest.mock('~/utils/encryption', () => ({
  hashPassword: jest.fn().mockResolvedValue('hashed_password'),
}));

describe('Rate Limiting Security', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('Authentication Endpoints', () => {
    it('should block after 5 failed signup attempts', async () => {
      const attempts = 6;
      const results = [];

      for (let i = 0; i < attempts; i++) {
        const { req, res } = createMocks({
          method: 'POST',
          url: '/api/auth/signup',
          headers: {
            'x-forwarded-for': '192.168.1.1', // Same IP for all attempts
          },
          body: {
            email: `test${i}@example.com`,
            password: 'password123',
          },
        });

        await signupHandler(req, res);
        results.push(res._getStatusCode());
      }

      // First 5 attempts should work (though may fail for other reasons)
      // 6th attempt should be rate limited
      expect(results[5]).toBe(429);
    });

    it('should include proper rate limit headers', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        url: '/api/auth/signup',
        headers: {
          'x-forwarded-for': '192.168.1.2',
        },
        body: {
          email: 'test@example.com',
          password: 'password123',
        },
      });

      await signupHandler(req, res);

      // Check rate limit headers are present
      expect(res._getHeaders()['x-ratelimit-limit']).toBeDefined();
      expect(res._getHeaders()['x-ratelimit-remaining']).toBeDefined();
      expect(res._getHeaders()['x-ratelimit-reset']).toBeDefined();
    });

    it('should track rate limits per IP address', async () => {
      // First IP address - make 3 requests
      for (let i = 0; i < 3; i++) {
        const { req, res } = createMocks({
          method: 'POST',
          url: '/api/auth/signup',
          headers: {
            'x-forwarded-for': '192.168.1.3',
          },
          body: {
            email: `test${i}@example.com`,
            password: 'password123',
          },
        });
        await signupHandler(req, res);
      }

      // Different IP address - should not be rate limited
      const { req: req2, res: res2 } = createMocks({
        method: 'POST',
        url: '/api/auth/signup',
        headers: {
          'x-forwarded-for': '192.168.1.4',
        },
        body: {
          email: 'different@example.com',
          password: 'password123',
        },
      });

      await signupHandler(req2, res2);
      
      // Should not be rate limited since it's a different IP
      expect(res2._getStatusCode()).not.toBe(429);
    });
  });

  describe('Rate Limiter Utility', () => {
    it('should properly calculate remaining requests', async () => {
      const { req, res } = createMocks({
        method: 'GET',
        url: '/api/test',
        headers: {
          'x-forwarded-for': '192.168.1.5',
        },
      });

      const result = await authRateLimit(req, res);
      
      expect(result.success).toBe(true);
      expect(result.remaining).toBe(4); // 5 total, 1 used
      expect(result.limit).toBe(5);
    });

    it('should reset after time window expires', async () => {
      jest.useFakeTimers();
      
      const { req: req1, res: res1 } = createMocks({
        method: 'GET',
        url: '/api/test',
        headers: {
          'x-forwarded-for': '192.168.1.6',
        },
      });

      // Make 5 requests to hit the limit
      for (let i = 0; i < 5; i++) {
        await authRateLimit(req1, res1);
      }

      // 6th request should be blocked
      const result1 = await authRateLimit(req1, res1);
      expect(result1.success).toBe(false);

      // Advance time by 16 minutes (past the 15-minute window)
      jest.advanceTimersByTime(16 * 60 * 1000);

      // Now the request should succeed
      const { req: req2, res: res2 } = createMocks({
        method: 'GET',
        url: '/api/test',
        headers: {
          'x-forwarded-for': '192.168.1.6',
        },
      });

      const result2 = await authRateLimit(req2, res2);
      expect(result2.success).toBe(true);

      jest.useRealTimers();
    });
  });
});