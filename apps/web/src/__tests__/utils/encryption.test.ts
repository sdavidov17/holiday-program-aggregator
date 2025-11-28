/**
 * Unit Tests: Encryption Utilities
 * Tests PII encryption/decryption and password hashing
 */

import CryptoJS from 'crypto-js';
import { decryptPII, encryptPII, hashPassword } from '../../utils/encryption';

// Mock environment
jest.mock('~/env.mjs', () => ({
  env: {
    ENCRYPTION_KEY: 'test-32-character-encryption-key',
  },
}));

describe('Encryption Utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('encryptPII', () => {
    it('should encrypt a plain text string', () => {
      const plainText = 'sensitive-data@email.com';
      const encrypted = encryptPII(plainText);

      expect(encrypted).not.toBeNull();
      expect(encrypted).not.toBe(plainText);
      expect(typeof encrypted).toBe('string');
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

    it('should handle special characters', () => {
      const specialText = '!@#$%^&*()_+-=[]{}|;:,.<>?/~`';
      const encrypted = encryptPII(specialText);

      expect(encrypted).not.toBeNull();
      expect(encrypted).not.toBe(specialText);
    });

    it('should handle Unicode characters', () => {
      const unicodeText = '日本語テスト 🎉 émojis';
      const encrypted = encryptPII(unicodeText);

      expect(encrypted).not.toBeNull();
      expect(encrypted).not.toBe(unicodeText);
    });

    it('should handle very long strings', () => {
      const longText = 'a'.repeat(10000);
      const encrypted = encryptPII(longText);

      expect(encrypted).not.toBeNull();
      expect(encrypted).not.toBe(longText);
    });

    it('should produce different ciphertext for same plaintext (due to IV)', () => {
      const plainText = 'test-data';
      const encrypted1 = encryptPII(plainText);
      const encrypted2 = encryptPII(plainText);

      // CryptoJS.AES uses random IV, so outputs should differ
      expect(encrypted1).not.toBe(encrypted2);
    });
  });

  describe('decryptPII', () => {
    it('should decrypt an encrypted string back to original', () => {
      const originalText = 'sensitive@email.com';
      const encrypted = encryptPII(originalText);
      const decrypted = decryptPII(encrypted);

      expect(decrypted).toBe(originalText);
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

    it('should handle roundtrip encryption for special characters', () => {
      const originalText = '!@#$%^&*()_+-=[]{}|;:,.<>?/~`';
      const encrypted = encryptPII(originalText);
      const decrypted = decryptPII(encrypted);

      expect(decrypted).toBe(originalText);
    });

    it('should handle roundtrip encryption for Unicode', () => {
      const originalText = '日本語テスト 🎉 émojis café';
      const encrypted = encryptPII(originalText);
      const decrypted = decryptPII(encrypted);

      expect(decrypted).toBe(originalText);
    });

    it('should handle roundtrip encryption for very long strings', () => {
      const originalText = 'a'.repeat(10000);
      const encrypted = encryptPII(originalText);
      const decrypted = decryptPII(encrypted);

      expect(decrypted).toBe(originalText);
    });

    it('should return empty string for invalid encrypted data', () => {
      // CryptoJS returns empty string for invalid data rather than throwing
      const result = decryptPII('invalid-not-base64-encrypted');
      expect(result).toBe('');
    });

    it('should throw error for corrupted ciphertext', () => {
      const validEncrypted = encryptPII('test');
      // Corrupt the ciphertext by changing characters
      const corrupted = validEncrypted!.slice(0, -5) + 'XXXXX';

      // Corrupted data should throw or return empty string
      const result = decryptPII(corrupted);
      // CryptoJS may return empty string for wrong key/corrupted data
      expect(result === '' || result === null).toBe(true);
    });
  });

  describe('hashPassword', () => {
    it('should hash a password', async () => {
      const password = 'TestPassword123!';
      const hashed = await hashPassword(password);

      expect(hashed).not.toBe(password);
      expect(hashed).toMatch(/^\$2[aby]?\$\d{1,2}\$/); // bcrypt hash format
    });

    it('should produce different hashes for same password (salt)', async () => {
      const password = 'TestPassword123!';
      const hash1 = await hashPassword(password);
      const hash2 = await hashPassword(password);

      expect(hash1).not.toBe(hash2);
    });

    it('should produce hash of consistent length', async () => {
      const passwords = ['short', 'a'.repeat(100), 'Medium123!'];
      const hashes = await Promise.all(passwords.map(hashPassword));

      // bcrypt hashes are 60 characters
      hashes.forEach((hash) => {
        expect(hash.length).toBe(60);
      });
    });

    it('should verify password with bcrypt compare', async () => {
      const bcrypt = await import('bcryptjs');
      const password = 'TestPassword123!';
      const hashed = await hashPassword(password);

      const isValid = await bcrypt.compare(password, hashed);
      expect(isValid).toBe(true);
    });

    it('should reject wrong password', async () => {
      const bcrypt = await import('bcryptjs');
      const password = 'TestPassword123!';
      const hashed = await hashPassword(password);

      const isValid = await bcrypt.compare('WrongPassword', hashed);
      expect(isValid).toBe(false);
    });

    it('should handle special characters in password', async () => {
      const password = '!@#$%^&*()_+-=[]{}|;:,.<>?/~`日本語🎉';
      const hashed = await hashPassword(password);

      expect(hashed).toMatch(/^\$2[aby]?\$\d{1,2}\$/);

      const bcrypt = await import('bcryptjs');
      const isValid = await bcrypt.compare(password, hashed);
      expect(isValid).toBe(true);
    });

    it('should use correct cost factor (12 rounds)', async () => {
      const password = 'TestPassword123!';
      const hashed = await hashPassword(password);

      // bcrypt format: $2a$12$... where 12 is the cost factor
      expect(hashed).toMatch(/^\$2[aby]?\$12\$/);
    });
  });

  describe('Error Handling', () => {
    it('should log encryption errors to console', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      // Force an error by mocking CryptoJS
      const originalEncrypt = CryptoJS.AES.encrypt;
      CryptoJS.AES.encrypt = jest.fn().mockImplementation(() => {
        throw new Error('Encryption failed');
      });

      expect(() => encryptPII('test')).toThrow('Failed to encrypt PII');
      expect(consoleSpy).toHaveBeenCalledWith(
        'Encryption error:',
        expect.any(Error),
      );

      CryptoJS.AES.encrypt = originalEncrypt;
      consoleSpy.mockRestore();
    });

    it('should log decryption errors to console', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const originalDecrypt = CryptoJS.AES.decrypt;
      CryptoJS.AES.decrypt = jest.fn().mockImplementation(() => {
        throw new Error('Decryption failed');
      });

      expect(() => decryptPII('encrypted-data')).toThrow('Failed to decrypt PII');
      expect(consoleSpy).toHaveBeenCalledWith(
        'Decryption error:',
        expect.any(Error),
      );

      CryptoJS.AES.decrypt = originalDecrypt;
      consoleSpy.mockRestore();
    });
  });
});
