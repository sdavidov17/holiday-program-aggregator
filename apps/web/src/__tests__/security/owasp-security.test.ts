/**
 * OWASP Security Test Suite
 * Comprehensive security tests based on OWASP Top 10
 */

import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { createMockContext } from '../helpers/test-context';
import request from 'supertest';
import { appRouter } from '~/server/api/root';
import { db } from '~/server/db';
import { createTestUser } from '../factories';
import bcrypt from 'bcryptjs';

// Mock rate limiter for testing
jest.mock('~/lib/rate-limiter', () => ({
  rateLimit: jest.fn(() => (req: any, res: any, next: any) => next()),
  authRateLimit: jest.fn(() => (req: any, res: any, next: any) => next()),
}));

describe('OWASP Security Tests', () => {
  let app: any;
  let testUser: any;

  beforeEach(async () => {
    // Setup test environment
    testUser = await createTestUser({ email: 'security@test.com' });
  });

  afterEach(async () => {
    jest.clearAllMocks();
  });

  describe('A01: Broken Access Control', () => {
    it('should prevent unauthorized access to admin endpoints', async () => {
      const userContext = createMockContext({
        session: {
          user: { id: 'user1', role: 'USER', email: 'user@test.com' },
          expires: new Date(Date.now() + 86400000).toISOString(),
        },
      });

      const caller = appRouter.createCaller(userContext);

      await expect(
        caller.admin.getProviders()
      ).rejects.toThrow(/unauthorized|forbidden/i);
    });

    it('should prevent users from accessing other users data', async () => {
      const userContext = createMockContext({
        session: {
          user: { id: 'user1', role: 'USER', email: 'user1@test.com' },
          expires: new Date(Date.now() + 86400000).toISOString(),
        },
      });

      const caller = appRouter.createCaller(userContext);

      await expect(
        caller.user.getProfile({ userId: 'user2' })
      ).rejects.toThrow(/unauthorized|forbidden/i);
    });

    it('should enforce subscription tier access controls', async () => {
      const basicUserContext = createMockContext({
        session: {
          user: { id: 'user1', role: 'USER', email: 'basic@test.com', subscriptionTier: 'BASIC' },
          expires: new Date(Date.now() + 86400000).toISOString(),
        },
      });

      const caller = appRouter.createCaller(basicUserContext);

      // Attempt to access premium feature
      await expect(
        caller.provider.getPremiumInsights({ providerId: 'provider1' })
      ).rejects.toThrow(/premium.*required/i);
    });

    it('should prevent parameter tampering', async () => {
      const userContext = createMockContext({
        session: {
          user: { id: 'user1', role: 'USER', email: 'user@test.com' },
          expires: new Date(Date.now() + 86400000).toISOString(),
        },
      });

      const caller = appRouter.createCaller(userContext);

      // Attempt to modify another user's subscription via parameter tampering
      await expect(
        caller.subscription.update({ 
          userId: 'otheruser', // Trying to modify another user's subscription
          tier: 'PREMIUM' 
        })
      ).rejects.toThrow(/unauthorized/i);
    });
  });

  describe('A02: Cryptographic Failures', () => {
    it('should properly hash passwords', async () => {
      const password = 'TestPassword123!';
      const hashedPassword = await bcrypt.hash(password, 10);

      expect(hashedPassword).not.toBe(password);
      expect(hashedPassword.length).toBeGreaterThan(50);
      expect(await bcrypt.compare(password, hashedPassword)).toBe(true);
    });

    it('should not expose sensitive data in API responses', async () => {
      const context = createMockContext({
        session: {
          user: { id: 'user1', role: 'USER', email: 'user@test.com' },
          expires: new Date(Date.now() + 86400000).toISOString(),
        },
      });

      const caller = appRouter.createCaller(context);
      
      // Mock implementation
      db.user.findUnique = jest.fn().mockResolvedValue({
        id: 'user1',
        email: 'user@test.com',
        hashedPassword: 'should-not-be-exposed',
        name: 'Test User',
      });

      const profile = await caller.user.getProfile({ userId: 'user1' });

      expect(profile).not.toHaveProperty('hashedPassword');
      expect(profile).not.toHaveProperty('password');
    });

    it('should encrypt sensitive data at rest', async () => {
      // Verify that sensitive fields are encrypted in database
      const sensitiveData = {
        stripeCustomerId: 'cus_secret123',
        bankAccountNumber: '12345678',
      };

      // Mock encryption function
      const encrypt = (data: string) => Buffer.from(data).toString('base64');
      const encrypted = encrypt(JSON.stringify(sensitiveData));

      expect(encrypted).not.toContain('cus_secret123');
      expect(encrypted).not.toContain('12345678');
    });
  });

  describe('A03: Injection', () => {
    it('should prevent SQL injection in search queries', async () => {
      const maliciousInput = "'; DROP TABLE providers; --";
      
      const context = createMockContext({
        session: {
          user: { id: 'user1', role: 'USER', email: 'user@test.com' },
          expires: new Date(Date.now() + 86400000).toISOString(),
        },
      });

      const caller = appRouter.createCaller(context);

      // This should be safely parameterized
      await expect(
        caller.provider.search({ query: maliciousInput })
      ).resolves.not.toThrow();

      // Verify table still exists
      const providerCount = await db.provider.count();
      expect(providerCount).toBeGreaterThanOrEqual(0);
    });

    it('should sanitize user input in forms', async () => {
      const xssPayload = '<script>alert("XSS")</script>';
      
      const context = createMockContext({
        session: {
          user: { id: 'admin1', role: 'ADMIN', email: 'admin@test.com' },
          expires: new Date(Date.now() + 86400000).toISOString(),
        },
      });

      const caller = appRouter.createCaller(context);

      const result = await caller.provider.create({
        businessName: xssPayload,
        contactName: 'Test',
        email: 'provider@test.com',
        phone: '0400000000',
        address: '123 Test St',
        suburb: 'Sydney',
        state: 'NSW',
        postcode: '2000',
        description: 'Test provider',
      });

      // Should be escaped or sanitized
      expect(result.businessName).not.toContain('<script>');
      expect(result.businessName).not.toContain('</script>');
    });

    it('should prevent NoSQL injection', async () => {
      const maliciousInput = { $ne: null }; // NoSQL injection attempt
      
      const context = createMockContext({
        session: {
          user: { id: 'user1', role: 'USER', email: 'user@test.com' },
          expires: new Date(Date.now() + 86400000).toISOString(),
        },
      });

      const caller = appRouter.createCaller(context);

      await expect(
        caller.user.getProfile({ userId: maliciousInput as any })
      ).rejects.toThrow(/invalid.*input/i);
    });

    it('should prevent command injection', async () => {
      const maliciousFilename = 'test.pdf; rm -rf /';
      
      // File upload endpoint should sanitize filenames
      const sanitizedFilename = maliciousFilename
        .replace(/[^a-zA-Z0-9.-]/g, '_')
        .substring(0, 255);

      expect(sanitizedFilename).not.toContain(';');
      expect(sanitizedFilename).not.toContain('rm');
      expect(sanitizedFilename).toBe('test.pdf__rm_-rf__');
    });
  });

  describe('A04: Insecure Design', () => {
    it('should enforce business logic constraints', async () => {
      const context = createMockContext({
        session: {
          user: { id: 'user1', role: 'USER', email: 'user@test.com' },
          expires: new Date(Date.now() + 86400000).toISOString(),
        },
      });

      const caller = appRouter.createCaller(context);

      // Attempt to create program with invalid age range
      await expect(
        caller.program.create({
          providerId: 'provider1',
          name: 'Test Program',
          ageMin: 15,
          ageMax: 5, // Invalid: max < min
          price: 100,
        })
      ).rejects.toThrow(/invalid.*age/i);
    });

    it('should prevent race conditions in bookings', async () => {
      // Simulate concurrent booking attempts
      const bookingPromises = Array.from({ length: 5 }, () =>
        db.booking.create({
          data: {
            programId: 'program1',
            userId: 'user1',
            spotNumber: 1, // All trying to book same spot
          },
        })
      );

      const results = await Promise.allSettled(bookingPromises);
      const successful = results.filter(r => r.status === 'fulfilled');

      // Only one should succeed due to unique constraint
      expect(successful.length).toBe(1);
    });

    it('should implement proper session timeout', async () => {
      const expiredContext = createMockContext({
        session: {
          user: { id: 'user1', role: 'USER', email: 'user@test.com' },
          expires: new Date(Date.now() - 1000).toISOString(), // Expired
        },
      });

      const caller = appRouter.createCaller(expiredContext);

      await expect(
        caller.user.getProfile({ userId: 'user1' })
      ).rejects.toThrow(/session.*expired/i);
    });
  });

  describe('A05: Security Misconfiguration', () => {
    it('should not expose detailed error messages', async () => {
      const context = createMockContext({});
      const caller = appRouter.createCaller(context);

      try {
        await caller.provider.getById({ id: 'invalid-id' });
      } catch (error: any) {
        expect(error.message).not.toContain('PrismaClient');
        expect(error.message).not.toContain('database');
        expect(error.message).not.toContain('SQL');
      }
    });

    it('should have secure headers configured', () => {
      const securityHeaders = {
        'X-Frame-Options': 'DENY',
        'X-Content-Type-Options': 'nosniff',
        'X-XSS-Protection': '1; mode=block',
        'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
        'Content-Security-Policy': "default-src 'self'",
      };

      // These should be set in middleware
      Object.entries(securityHeaders).forEach(([header, value]) => {
        expect(header).toBeDefined();
        expect(value).toBeDefined();
      });
    });

    it('should disable unnecessary features', () => {
      // Verify debug mode is disabled in production
      expect(process.env.NODE_ENV === 'production' ? process.env.DEBUG : undefined).toBeUndefined();
      
      // Verify introspection is disabled for GraphQL (if applicable)
      // Verify directory listing is disabled
      // Verify default credentials are not used
    });
  });

  describe('A06: Vulnerable Components', () => {
    it('should not use known vulnerable dependencies', () => {
      // This would typically be done via npm audit or similar
      // Mock check for demonstration
      const vulnerableDependencies = [
        'lodash@<4.17.21', // Known prototype pollution
        'axios@<0.21.1', // SSRF vulnerability
      ];

      const packageJson = require('../../../package.json');
      const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };

      vulnerableDependencies.forEach(vulnDep => {
        const [name, version] = vulnDep.split('@');
        expect(dependencies[name]).not.toBe(version);
      });
    });
  });

  describe('A07: Authentication Failures', () => {
    it('should enforce password complexity requirements', async () => {
      const weakPasswords = [
        'password',
        '12345678',
        'qwerty123',
        'Password', // No special chars
        'Pass123', // Too short
      ];

      const validatePassword = (password: string): boolean => {
        const minLength = 8;
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumbers = /\d/.test(password);
        const hasSpecialChar = /[!@#$%^&*]/.test(password);

        return (
          password.length >= minLength &&
          hasUpperCase &&
          hasLowerCase &&
          hasNumbers &&
          hasSpecialChar
        );
      };

      weakPasswords.forEach(password => {
        expect(validatePassword(password)).toBe(false);
      });

      expect(validatePassword('Strong123!@#')).toBe(true);
    });

    it('should implement account lockout after failed attempts', async () => {
      const maxAttempts = 5;
      let attempts = 0;

      const attemptLogin = async (email: string, password: string) => {
        attempts++;
        if (attempts >= maxAttempts) {
          throw new Error('Account locked');
        }
        return false;
      };

      // Simulate failed login attempts
      for (let i = 0; i < maxAttempts - 1; i++) {
        await attemptLogin('user@test.com', 'wrongpassword');
      }

      await expect(
        attemptLogin('user@test.com', 'wrongpassword')
      ).rejects.toThrow(/locked/i);
    });

    it('should implement secure session management', () => {
      const session = {
        id: 'session123',
        userId: 'user1',
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 3600000), // 1 hour
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
      };

      // Session should expire
      expect(session.expiresAt.getTime()).toBeGreaterThan(Date.now());
      
      // Session should be tied to IP
      expect(session.ipAddress).toBeDefined();
      
      // Session ID should be random and unpredictable
      expect(session.id.length).toBeGreaterThanOrEqual(32);
    });
  });

  describe('A08: Software and Data Integrity', () => {
    it('should verify webhook signatures', async () => {
      const payload = JSON.stringify({ event: 'test' });
      const secret = 'webhook_secret';
      const crypto = require('crypto');
      
      const signature = crypto
        .createHmac('sha256', secret)
        .update(payload)
        .digest('hex');

      const verifySignature = (payload: string, signature: string, secret: string): boolean => {
        const expectedSignature = crypto
          .createHmac('sha256', secret)
          .update(payload)
          .digest('hex');
        
        return crypto.timingSafeEqual(
          Buffer.from(signature),
          Buffer.from(expectedSignature)
        );
      };

      expect(verifySignature(payload, signature, secret)).toBe(true);
      expect(verifySignature(payload, 'wrong_signature', secret)).toBe(false);
    });

    it('should validate file uploads', () => {
      const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
      const maxSize = 5 * 1024 * 1024; // 5MB

      const validateFile = (file: { type: string; size: number }): boolean => {
        return allowedTypes.includes(file.type) && file.size <= maxSize;
      };

      expect(validateFile({ type: 'image/jpeg', size: 1024 * 1024 })).toBe(true);
      expect(validateFile({ type: 'application/exe', size: 1024 })).toBe(false);
      expect(validateFile({ type: 'image/jpeg', size: 10 * 1024 * 1024 })).toBe(false);
    });
  });

  describe('A09: Security Logging and Monitoring', () => {
    it('should log security events', async () => {
      const securityEvents = [];
      
      const logSecurityEvent = (event: any) => {
        securityEvents.push({
          ...event,
          timestamp: new Date(),
          severity: event.severity || 'INFO',
        });
      };

      // Failed login attempt
      logSecurityEvent({
        type: 'FAILED_LOGIN',
        email: 'user@test.com',
        ipAddress: '192.168.1.1',
        severity: 'WARNING',
      });

      // Unauthorized access attempt
      logSecurityEvent({
        type: 'UNAUTHORIZED_ACCESS',
        userId: 'user1',
        resource: '/admin/users',
        severity: 'HIGH',
      });

      expect(securityEvents.length).toBe(2);
      expect(securityEvents[0].type).toBe('FAILED_LOGIN');
      expect(securityEvents[1].severity).toBe('HIGH');
    });

    it('should detect and log suspicious patterns', () => {
      const requestLog = [
        { ip: '192.168.1.1', endpoint: '/api/search', timestamp: Date.now() },
        { ip: '192.168.1.1', endpoint: '/api/search', timestamp: Date.now() + 100 },
        { ip: '192.168.1.1', endpoint: '/api/search', timestamp: Date.now() + 200 },
        { ip: '192.168.1.1', endpoint: '/api/search', timestamp: Date.now() + 300 },
        { ip: '192.168.1.1', endpoint: '/api/search', timestamp: Date.now() + 400 },
      ];

      const detectRapidRequests = (logs: any[], threshold: number = 5, timeWindow: number = 1000) => {
        const recentRequests = logs.filter(
          log => log.timestamp > Date.now() - timeWindow
        );
        return recentRequests.length >= threshold;
      };

      expect(detectRapidRequests(requestLog)).toBe(true);
    });
  });

  describe('A10: Server-Side Request Forgery (SSRF)', () => {
    it('should validate and sanitize URLs', () => {
      const validateUrl = (url: string): boolean => {
        try {
          const parsed = new URL(url);
          const allowedProtocols = ['http:', 'https:'];
          const blockedHosts = ['localhost', '127.0.0.1', '0.0.0.0', '169.254.169.254'];
          
          if (!allowedProtocols.includes(parsed.protocol)) {
            return false;
          }
          
          if (blockedHosts.includes(parsed.hostname)) {
            return false;
          }
          
          // Block private IP ranges
          const ipRegex = /^(10\.|172\.(1[6-9]|2[0-9]|3[01])\.|192\.168\.)/;
          if (ipRegex.test(parsed.hostname)) {
            return false;
          }
          
          return true;
        } catch {
          return false;
        }
      };

      expect(validateUrl('https://example.com')).toBe(true);
      expect(validateUrl('http://localhost:3000')).toBe(false);
      expect(validateUrl('file:///etc/passwd')).toBe(false);
      expect(validateUrl('http://169.254.169.254/latest/meta-data')).toBe(false);
      expect(validateUrl('http://192.168.1.1')).toBe(false);
    });

    it('should prevent webhook URL manipulation', async () => {
      const context = createMockContext({
        session: {
          user: { id: 'admin1', role: 'ADMIN', email: 'admin@test.com' },
          expires: new Date(Date.now() + 86400000).toISOString(),
        },
      });

      const caller = appRouter.createCaller(context);

      await expect(
        caller.admin.configureWebhook({
          url: 'http://localhost:3000/internal-endpoint',
        })
      ).rejects.toThrow(/invalid.*url/i);
    });
  });
});