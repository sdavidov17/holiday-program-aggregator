import { type NextApiRequest, type NextApiResponse } from "next";
import { db } from "~/server/db";
import bcrypt from "bcryptjs";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow in non-production or with secret key
  const secretKey = req.headers["x-seed-key"];
  if (process.env.NODE_ENV === "production" && secretKey !== process.env.ADMIN_SETUP_KEY) {
    return res.status(403).json({ error: "Forbidden" });
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Admin credentials
    const adminEmail = process.env.ADMIN_EMAIL || "serge@test.com";
    const adminPassword = process.env.ADMIN_PASSWORD || "Password120619";
    const adminName = process.env.ADMIN_NAME || "Admin User";

    // Check if admin already exists
    const existingAdmin = await db.user.findUnique({
      where: { email: adminEmail },
    });

    if (existingAdmin) {
      // Update existing admin
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      
      await db.user.update({
        where: { email: adminEmail },
        data: {
          password: hashedPassword,
          role: "ADMIN",
          emailVerified: new Date(),
        },
      });
      
      return res.status(200).json({
        message: "Admin user updated successfully",
        email: adminEmail,
      });
    }

    // Create new admin
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    
    const admin = await db.user.create({
      data: {
        email: adminEmail,
        name: adminName,
        password: hashedPassword,
        role: "ADMIN",
        emailVerified: new Date(),
      },
    });

    // Also create regular test user
    const regularUserEmail = "serge.user@test.com";
    const existingRegularUser = await db.user.findUnique({
      where: { email: regularUserEmail },
    });

    if (!existingRegularUser) {
      await db.user.create({
        data: {
          email: regularUserEmail,
          name: "Serge (User)",
          password: hashedPassword,
          role: "USER",
          emailVerified: new Date(),
        },
      });
    }

    res.status(201).json({
      message: "Admin users created successfully",
      admin: adminEmail,
      regularUser: regularUserEmail,
    });
  } catch (error) {
    console.error("Seed admin error:", error);
    res.status(500).json({
      error: "Failed to seed admin",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}