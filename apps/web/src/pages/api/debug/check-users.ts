import { type NextApiRequest, type NextApiResponse } from "next";
import { db } from "~/server/db";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Get all users (without passwords)
    // Use raw query to handle potential enum issues
    const users = await db.$queryRaw`
      SELECT 
        id,
        email,
        name,
        CAST(role AS TEXT) as role,
        "emailVerified",
        "createdAt",
        CASE WHEN password IS NOT NULL THEN true ELSE false END as "hasPassword",
        LENGTH(password) as "passwordLength"
      FROM "User"
    ` as any[];

    // Users are already formatted from the raw query

    res.status(200).json({
      totalUsers: users.length,
      users: users,
      adminExists: users.some(u => u.role === "ADMIN"),
      sergeExists: users.some(u => u.email === "serge@test.com"),
      databaseUrl: process.env.DATABASE_URL ? "Configured" : "Missing",
      environment: process.env.NODE_ENV,
    });
  } catch (error) {
    console.error("Check users error:", error);
    res.status(500).json({
      error: "Failed to check users",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}