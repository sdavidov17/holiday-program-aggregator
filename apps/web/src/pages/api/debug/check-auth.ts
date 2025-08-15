import bcrypt from 'bcryptjs';
import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '~/server/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow in development or with debug key
  if (
    process.env.NODE_ENV === 'production' &&
    req.headers['x-debug-key'] !== process.env.ADMIN_SETUP_KEY
  ) {
    return res.status(404).json({ error: 'Not found' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, password } = req.body as { email: string; password: string };

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  try {
    // Step 1: Check if user exists
    const user = await db.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        password: true,
        role: true,
        emailVerified: true,
        name: true,
      },
    });

    if (!user) {
      return res.status(200).json({
        debug: {
          userFound: false,
          message: 'User not found in database',
          searchedEmail: email,
        },
      });
    }

    // Step 2: Check if user has password
    if (!user.password) {
      return res.status(200).json({
        debug: {
          userFound: true,
          hasPassword: false,
          message: 'User exists but has no password (OAuth-only account?)',
          userData: {
            id: user.id,
            email: user.email,
            role: user.role,
            emailVerified: !!user.emailVerified,
          },
        },
      });
    }

    // Step 3: Verify password
    const passwordValid = await bcrypt.compare(password, user.password);

    return res.status(200).json({
      debug: {
        userFound: true,
        hasPassword: true,
        passwordValid,
        message: passwordValid ? 'Authentication would succeed' : 'Password does not match',
        userData: {
          id: user.id,
          email: user.email,
          role: user.role,
          emailVerified: !!user.emailVerified,
          name: user.name,
        },
      },
    });
  } catch (error) {
    console.error('Debug auth check error:', error);
    return res.status(500).json({
      error: 'Database error',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
