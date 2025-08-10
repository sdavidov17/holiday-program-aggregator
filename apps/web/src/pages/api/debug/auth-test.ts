import { type NextApiRequest, type NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Test if bcryptjs is available
    const bcrypt = await import("bcryptjs");
    const testHash = await bcrypt.hash("test", 10);
    
    // Test if crypto-js is available
    const CryptoJS = await import("crypto-js");
    const encrypted = CryptoJS.AES.encrypt("test", "key").toString();
    
    // Check environment variables
    const envCheck = {
      DATABASE_URL: !!process.env.DATABASE_URL,
      NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
      NEXTAUTH_URL: !!process.env.NEXTAUTH_URL,
      ENCRYPTION_KEY: !!process.env.ENCRYPTION_KEY,
      NODE_ENV: process.env.NODE_ENV,
      VERCEL: !!process.env.VERCEL,
    };
    
    res.status(200).json({
      status: "ok",
      bcryptjs: "available",
      cryptojs: "available",
      testHash: testHash.substring(0, 10) + "...",
      encrypted: encrypted.substring(0, 10) + "...",
      environment: envCheck,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Auth test error:", error);
    res.status(500).json({
      error: "Failed to test auth dependencies",
      message: error instanceof Error ? error.message : "Unknown error",
      stack: process.env.NODE_ENV === "development" ? (error as Error).stack : undefined,
    });
  }
}