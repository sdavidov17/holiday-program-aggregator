import { type NextApiRequest, type NextApiResponse } from "next";
import { z } from "zod";
import { db } from "~/server/db";
import { hashPassword } from "~/utils/encryption";
import { authRateLimit } from "~/lib/rate-limiter";

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Apply rate limiting for signup
  const rateLimitResult = await authRateLimit(req, res);
  if (!rateLimitResult.success) {
    return res.status(429).json({ 
      error: "Too many signup attempts. Please try again later.",
      retryAfter: rateLimitResult.reset
    });
  }

  try {
    const parsed = signupSchema.safeParse(req.body);
    
    if (!parsed.success) {
      return res.status(400).json({ 
        error: "Invalid input",
        details: parsed.error.errors 
      });
    }

    const { email, password } = parsed.data;

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(409).json({ error: "User already exists" });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = await db.user.create({
      data: {
        email,
        password: hashedPassword,
      },
    });

    res.status(201).json({
      message: "User created successfully",
      userId: user.id,
    });
  } catch (error) {
    console.error("Signup error:", error);
    
    // Provide more detailed error in development
    const errorMessage = error instanceof Error ? error.message : "Failed to create user";
    const errorDetails = process.env.NODE_ENV === "development" && error instanceof Error 
      ? { stack: error.stack, name: error.name }
      : undefined;
    
    res.status(500).json({ 
      error: errorMessage,
      details: errorDetails
    });
  }
}