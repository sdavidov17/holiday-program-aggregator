import CryptoJS from 'crypto-js';
import { env } from '~/env.mjs';

// Encryption key must be set in production
const DEV_FALLBACK_KEY = 'dev-only-32-char-key-not-for-prod!';

function getEncryptionKey(): string {
  if (env.ENCRYPTION_KEY) {
    return env.ENCRYPTION_KEY;
  }

  if (process.env.NODE_ENV === 'production') {
    throw new Error('ENCRYPTION_KEY environment variable is required in production');
  }

  console.warn('[DEV ONLY] Using development encryption key - never use in production');
  return DEV_FALLBACK_KEY;
}

const ENCRYPTION_KEY = getEncryptionKey();

export function encryptPII(text: string | null | undefined): string | null {
  if (!text) return null;

  try {
    return CryptoJS.AES.encrypt(text, ENCRYPTION_KEY).toString();
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt PII');
  }
}

export function decryptPII(encryptedText: string | null | undefined): string | null {
  if (!encryptedText) return null;

  try {
    const decrypted = CryptoJS.AES.decrypt(encryptedText, ENCRYPTION_KEY);
    return decrypted.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt PII');
  }
}

// Hash password using bcrypt
export async function hashPassword(password: string): Promise<string> {
  const bcrypt = await import('bcryptjs');
  return bcrypt.hash(password, 12);
}
