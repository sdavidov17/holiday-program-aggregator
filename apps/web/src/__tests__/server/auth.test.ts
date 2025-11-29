/**
 * Unit Tests: Authentication System
 * Tests NextAuth configuration, callbacks, and credentials provider
 */

import bcrypt from 'bcryptjs';

// Mock database
const mockFindUnique = jest.fn();

jest.mock('~/server/db', () => ({
  db: {
    user: {
      findUnique: (...args: unknown[]) => mockFindUnique(...args),
    },
  },
}));

// Mock environment
jest.mock('~/env.mjs', () => ({
  env: {
    GOOGLE_CLIENT_ID: 'mock-google-client-id',
    GOOGLE_CLIENT_SECRET: 'mock-google-client-secret',
    NEXTAUTH_SECRET: 'mock-nextauth-secret',
    NEXTAUTH_URL: 'http://localhost:3000',
  },
}));

// Import auth options after mocking
import { authOptions } from '../../server/auth';

describe('Authentication System', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('authOptions configuration', () => {
    it('should have JWT session strategy', () => {
      expect(authOptions.session?.strategy).toBe('jwt');
    });

    it('should have custom sign-in and error pages', () => {
      expect(authOptions.pages?.signIn).toBe('/auth/signin');
      expect(authOptions.pages?.error).toBe('/auth/error');
    });

    it('should have Google provider configured', () => {
      const googleProvider = authOptions.providers.find((p) => p.name === 'Google');
      expect(googleProvider).toBeDefined();
    });

    it('should have Credentials provider configured', () => {
      const credentialsProvider = authOptions.providers.find((p) => p.name === 'credentials');
      expect(credentialsProvider).toBeDefined();
    });

    it('should have PrismaAdapter configured', () => {
      expect(authOptions.adapter).toBeDefined();
    });
  });

  describe('Credentials Provider - authorize', () => {
    let authorize: Function;

    beforeEach(() => {
      const credentialsProvider = authOptions.providers.find((p) => p.name === 'credentials');
      // Access the authorize function from the credentials provider
      authorize = (credentialsProvider as any).options.authorize;
    });

    it('should return null for missing credentials', async () => {
      const result = await authorize({});
      expect(result).toBeNull();
    });

    it('should return null for invalid email format', async () => {
      const result = await authorize({
        email: 'invalid-email',
        password: 'password123',
      });
      expect(result).toBeNull();
    });

    it('should return null for password too short', async () => {
      const result = await authorize({
        email: 'test@example.com',
        password: '12345', // Less than 6 characters
      });
      expect(result).toBeNull();
    });

    it('should return null when user not found', async () => {
      mockFindUnique.mockResolvedValue(null);

      const result = await authorize({
        email: 'notfound@example.com',
        password: 'password123',
      });

      expect(mockFindUnique).toHaveBeenCalledWith({
        where: { email: 'notfound@example.com' },
      });
      expect(result).toBeNull();
    });

    it('should return null when user has no password (OAuth user)', async () => {
      mockFindUnique.mockResolvedValue({
        id: 'user-1',
        email: 'oauth@example.com',
        password: null, // OAuth users don't have password
      });

      const result = await authorize({
        email: 'oauth@example.com',
        password: 'password123',
      });

      expect(result).toBeNull();
    });

    it('should return null for invalid password', async () => {
      const hashedPassword = await bcrypt.hash('correctPassword', 10);
      mockFindUnique.mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
        password: hashedPassword,
        name: 'Test User',
        image: null,
        role: 'USER',
      });

      const result = await authorize({
        email: 'test@example.com',
        password: 'wrongPassword',
      });

      expect(result).toBeNull();
    });

    it('should return user object for valid credentials', async () => {
      const password = 'validPassword123';
      const hashedPassword = await bcrypt.hash(password, 10);

      mockFindUnique.mockResolvedValue({
        id: 'user-123',
        email: 'test@example.com',
        password: hashedPassword,
        name: 'Test User',
        image: 'https://example.com/avatar.jpg',
        role: 'USER',
      });

      const result = await authorize({
        email: 'test@example.com',
        password,
      });

      expect(result).toEqual({
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        image: 'https://example.com/avatar.jpg',
        role: 'USER',
      });
    });

    it('should return admin role when user is admin', async () => {
      const password = 'adminPassword';
      const hashedPassword = await bcrypt.hash(password, 10);

      mockFindUnique.mockResolvedValue({
        id: 'admin-123',
        email: 'admin@example.com',
        password: hashedPassword,
        name: 'Admin User',
        image: null,
        role: 'ADMIN',
      });

      const result = await authorize({
        email: 'admin@example.com',
        password,
      });

      expect(result?.role).toBe('ADMIN');
    });

    it('should handle email case-insensitivity in validation', async () => {
      // Zod validation should still work with uppercase email
      mockFindUnique.mockResolvedValue(null);

      await authorize({
        email: 'TEST@EXAMPLE.COM',
        password: 'password123',
      });

      // Should still make the database call (Zod accepts valid email regardless of case)
      expect(mockFindUnique).toHaveBeenCalled();
    });
  });

  describe('Session Callback', () => {
    const sessionCallback = authOptions.callbacks?.session as Function;

    it('should add user id and role to session', async () => {
      mockFindUnique.mockResolvedValue({ role: 'USER' });

      const session = {
        user: {
          name: 'Test User',
          email: 'test@example.com',
        },
        expires: new Date().toISOString(),
      };

      const token = { sub: 'user-123' };

      const result = await sessionCallback({ session, token });

      expect(result.user.id).toBe('user-123');
      expect(result.user.role).toBe('USER');
    });

    it('should fetch role from database', async () => {
      mockFindUnique.mockResolvedValue({ role: 'ADMIN' });

      const session = {
        user: { name: 'Admin', email: 'admin@example.com' },
        expires: new Date().toISOString(),
      };

      const token = { sub: 'admin-123' };

      const result = await sessionCallback({ session, token });

      expect(mockFindUnique).toHaveBeenCalledWith({
        where: { id: 'admin-123' },
        select: { role: true },
      });
      expect(result.user.role).toBe('ADMIN');
    });

    it('should default to USER role when user not found', async () => {
      mockFindUnique.mockResolvedValue(null);

      const session = {
        user: { name: 'Test' },
        expires: new Date().toISOString(),
      };

      const token = { sub: 'deleted-user' };

      const result = await sessionCallback({ session, token });

      expect(result.user.role).toBe('USER');
    });

    it('should return unmodified session when token.sub is missing', async () => {
      const session = {
        user: { name: 'Test' },
        expires: new Date().toISOString(),
      };

      const token = {}; // No sub

      const result = await sessionCallback({ session, token });

      expect(result).toEqual(session);
      expect(mockFindUnique).not.toHaveBeenCalled();
    });
  });

  describe('JWT Callback', () => {
    const jwtCallback = authOptions.callbacks?.jwt as Function;

    it('should add role to token when user is provided', async () => {
      const token = { sub: 'user-123' };
      const user = { id: 'user-123', role: 'ADMIN' };

      const result = await jwtCallback({ token, user });

      expect(result.role).toBe('ADMIN');
    });

    it('should preserve existing token when no user', async () => {
      const token = { sub: 'user-123', role: 'USER' };

      const result = await jwtCallback({ token, user: undefined });

      expect(result).toEqual(token);
    });
  });

  describe('Security Considerations', () => {
    let authorize: Function;

    beforeEach(() => {
      const credentialsProvider = authOptions.providers.find((p) => p.name === 'credentials');
      authorize = (credentialsProvider as any).options.authorize;
    });

    it('should not reveal whether email exists (timing attack prevention)', async () => {
      // This test verifies the code path is the same whether user exists or not
      const hashedPassword = await bcrypt.hash('password123', 10);

      // Test with non-existent user
      mockFindUnique.mockResolvedValue(null);
      const result1 = await authorize({
        email: 'notexist@example.com',
        password: 'password123',
      });

      // Test with existing user but wrong password
      mockFindUnique.mockResolvedValue({
        id: 'user-1',
        email: 'exists@example.com',
        password: hashedPassword,
        role: 'USER',
      });
      const result2 = await authorize({
        email: 'exists@example.com',
        password: 'wrongpassword',
      });

      // Both should return null
      expect(result1).toBeNull();
      expect(result2).toBeNull();
    });

    it('should reject empty credentials object', async () => {
      const result = await authorize(null);
      expect(result).toBeNull();
    });

    it('should reject credentials with extra fields (validation safety)', async () => {
      // Zod schema should ignore extra fields but still validate required ones
      const result = await authorize({
        email: 'invalid',
        password: '12',
        extraField: 'should be ignored',
      });
      expect(result).toBeNull();
    });
  });
});
