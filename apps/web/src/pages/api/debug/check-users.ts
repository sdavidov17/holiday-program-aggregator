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
    const users = await db.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        emailVerified: true,
        createdAt: true,
        password: true, // Include to check if password exists
      },
    });

    // Check if passwords exist (don't return actual hashes)
    const usersWithPasswordCheck = users.map(user => ({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
      hasPassword: !!user.password,
      passwordLength: user.password?.length || 0,
    }));

    res.status(200).json({
      totalUsers: users.length,
      users: usersWithPasswordCheck,
      adminExists: users.some(u => u.role === "ADMIN"),
      sergeExists: users.some(u => u.email === "serge@test.com"),
    });
  } catch (error) {
    console.error("Check users error:", error);
    res.status(500).json({
      error: "Failed to check users",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}