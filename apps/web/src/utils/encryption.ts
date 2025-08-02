import CryptoJS from "crypto-js";
import { env } from "~/env.mjs";

// Use environment variable or fallback for development
const ENCRYPTION_KEY = env.ENCRYPTION_KEY || "dev-32-character-encryption-key!!";

export function encryptPII(text: string | null | undefined): string | null {
  if (!text) return null;
  
  try {
    return CryptoJS.AES.encrypt(text, ENCRYPTION_KEY).toString();
  } catch (error) {
    console.error("Encryption error:", error);
    throw new Error("Failed to encrypt PII");
  }
}

export function decryptPII(encryptedText: string | null | undefined): string | null {
  if (!encryptedText) return null;
  
  try {
    const decrypted = CryptoJS.AES.decrypt(encryptedText, ENCRYPTION_KEY);
    return decrypted.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    console.error("Decryption error:", error);
    throw new Error("Failed to decrypt PII");
  }
}

// Hash password using bcrypt
export async function hashPassword(password: string): Promise<string> {
  const bcrypt = await import("bcryptjs");
  return bcrypt.hash(password, 12);
}