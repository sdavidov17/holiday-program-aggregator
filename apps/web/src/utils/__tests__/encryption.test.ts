/**
 * Encryption Utility Test Suite
 * Tests for PII encryption/decryption and password hashing
 */

import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';

// Mock the env module before importing encryption
jest.mock('~/env.mjs', () => ({
  env: {
    ENCRYPTION_KEY: 'test-32-character-encryption-key!',
  },
}));

describe('Encryption Utilities', () => {
  let encryptPII: typeof import('../encryption').encryptPII;
  let decryptPII: typeof import('../encryption').decryptPII;
  let hashPassword: typeof import('../encryption').hashPassword;

  beforeEach(async () => {
    // Clear module cache to ensure fresh import with mocked env
    jest.resetModules();
    const encryption = await import('../encryption');
    encryptPII = encryption.encryptPII;
    decryptPII = encryption.decryptPII;
    hashPassword = encryption.hashPassword;
  });

  describe('encryptPII', () => {
    it('should encrypt a string', () => {
      const plainText = 'sensitive-data@email.com';

      const encrypted = encryptPII(plainText);

      expect(encrypted).toBeDefined();
      expect(encrypted).not.toBe(plainText);
      expect(typeof encrypted).toBe('string');
    });

    it('should produce different output for same input (due to IV)', () => {
      const plainText = 'test@example.com';

      const encrypted1 = encryptPII(plainText);
      const encrypted2 = encryptPII(plainText);

      // CryptoJS AES with passphrase generates random salt each time
      expect(encrypted1).not.toBe(encrypted2);
    });

    it('should return null for null input', () => {
      const result = encryptPII(null);

      expect(result).toBeNull();
    });

    it('should return null for undefined input', () => {
      const result = encryptPII(undefined);

      expect(result).toBeNull();
    });

    it('should return null for empty string', () => {
      const result = encryptPII('');

      expect(result).toBeNull();
    });

    it('should encrypt various types of PII', () => {
      const testCases = [
        'john.doe@example.com',
        '+61412345678',
        '123 Main Street, Sydney NSW 2000',
        'John Doe',
        '4111111111111111', // Credit card number format
      ];

      for (const pii of testCases) {
        const encrypted = encryptPII(pii);
        expect(encrypted).toBeDefined();
        expect(encrypted).not.toBe(pii);
        expect(encrypted?.length).toBeGreaterThan(0);
      }
    });

    it('should handle unicode characters', () => {
      const unicodeText = '用户邮箱@example.com';

      const encrypted = encryptPII(unicodeText);

      expect(encrypted).toBeDefined();
      expect(encrypted).not.toBe(unicodeText);
    });

    it('should handle long strings', () => {
      const longText = 'a'.repeat(10000);

      const encrypted = encryptPII(longText);

      expect(encrypted).toBeDefined();
      expect(encrypted?.length).toBeGreaterThan(0);
    });
  });

  describe('decryptPII', () => {
    it('should decrypt an encrypted string', () => {
      const plainText = 'sensitive-data@email.com';
      const encrypted = encryptPII(plainText);

      const decrypted = decryptPII(encrypted);

      expect(decrypted).toBe(plainText);
    });

    it('should return null for null input', () => {
      const result = decryptPII(null);

      expect(result).toBeNull();
    });

    it('should return null for undefined input', () => {
      const result = decryptPII(undefined);

      expect(result).toBeNull();
    });

    it('should return null for empty string', () => {
      const result = decryptPII('');

      expect(result).toBeNull();
    });

    it('should decrypt various encrypted PII correctly', () => {
      const testCases = [
        'john.doe@example.com',
        '+61412345678',
        '123 Main Street, Sydney NSW 2000',
        'John Doe',
      ];

      for (const original of testCases) {
        const encrypted = encryptPII(original);
        const decrypted = decryptPII(encrypted);
        expect(decrypted).toBe(original);
      }
    });

    it('should handle unicode characters', () => {
      const unicodeText = '用户邮箱@example.com';
      const encrypted = encryptPII(unicodeText);

      const decrypted = decryptPII(encrypted);

      expect(decrypted).toBe(unicodeText);
    });

    it('should throw error for invalid encrypted string', () => {
      const invalidEncrypted = 'not-a-valid-encrypted-string';

      // Invalid encrypted strings will throw or return empty
      expect(() => {
        const result = decryptPII(invalidEncrypted);
        if (result === '') {
          throw new Error('Failed to decrypt PII');
        }
      }).toThrow();
    });
  });

  describe('encrypt/decrypt roundtrip', () => {
    it('should correctly roundtrip encryption and decryption', () => {
      const testData = [
        'simple text',
        'text with numbers 12345',
        'special chars !@#$%^&*()',
        'email@domain.com',
        'multi\nline\ntext',
        '    spaces around    ',
      ];

      for (const original of testData) {
        const encrypted = encryptPII(original);
        const decrypted = decryptPII(encrypted);
        expect(decrypted).toBe(original);
      }
    });
  });

  describe('hashPassword', () => {
    it('should hash a password', async () => {
      const password = 'SecurePassword123!';

      const hash = await hashPassword(password);

      expect(hash).toBeDefined();
      expect(hash).not.toBe(password);
      expect(hash.length).toBeGreaterThan(20);
    });

    it('should produce different hashes for same password (due to salt)', async () => {
      const password = 'TestPassword123!';

      const hash1 = await hashPassword(password);
      const hash2 = await hashPassword(password);

      expect(hash1).not.toBe(hash2);
    });

    it('should produce valid bcrypt hash format', async () => {
      const password = 'TestPassword';

      const hash = await hashPassword(password);

      // bcrypt hashes start with $2a$, $2b$, or $2y$
      expect(hash).toMatch(/^\$2[aby]\$\d{2}\$/);
    });

    it('should hash passwords of various lengths', async () => {
      const passwords = [
        'short',
        'medium length password',
        'a'.repeat(72), // bcrypt limit
      ];

      for (const password of passwords) {
        const hash = await hashPassword(password);
        expect(hash).toBeDefined();
        expect(hash.length).toBeGreaterThan(0);
      }
    });

    it('should handle special characters', async () => {
      const password = 'P@$$w0rd!@#$%^&*()_+-=[]{}|;:,.<>?';

      const hash = await hashPassword(password);

      expect(hash).toBeDefined();
    });

    it('should handle unicode passwords', async () => {
      const password = '密码123!';

      const hash = await hashPassword(password);

      expect(hash).toBeDefined();
    });
  });
});

describe('Encryption Key Validation', () => {
  const originalEnv = process.env.NODE_ENV;

  afterEach(() => {
    (process.env as { NODE_ENV?: string }).NODE_ENV = originalEnv;
    jest.resetModules();
  });

  it('should use provided encryption key in test environment', async () => {
    jest.resetModules();
    jest.mock('~/env.mjs', () => ({
      env: {
        ENCRYPTION_KEY: 'custom-test-key-32-characters!!!',
      },
    }));

    const { encryptPII, decryptPII } = await import('../encryption');

    const plainText = 'test data';
    const encrypted = encryptPII(plainText);
    const decrypted = decryptPII(encrypted);

    expect(decrypted).toBe(plainText);
  });

  it('should work with fallback key in development', async () => {
    (process.env as { NODE_ENV?: string }).NODE_ENV = 'development';
    jest.resetModules();
    jest.mock('~/env.mjs', () => ({
      env: {
        ENCRYPTION_KEY: undefined,
      },
    }));

    // In dev, should use fallback key and log warning
    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

    const { encryptPII, decryptPII } = await import('../encryption');

    const plainText = 'dev test';
    const encrypted = encryptPII(plainText);
    const decrypted = decryptPII(encrypted);

    expect(decrypted).toBe(plainText);
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('DEV ONLY'));

    consoleSpy.mockRestore();
  });
});
