import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '~/server/db';
import bcrypt from 'bcryptjs';
import { env } from '~/env.mjs';

/**
 * Admin Setup Endpoint
 * 
 * This endpoint creates the initial admin account in production.
 * It can only be run once and requires a setup key.
 * 
 * Usage:
 *   POST /api/admin/setup
 *   Headers: X-Setup-Key: your-setup-key
 *   Body: { email: "admin@example.com", password: "secure-password", name: "Admin Name" }
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Check setup key (should be set in environment variables)
  const setupKey = req.headers['x-setup-key'];
  const expectedKey = env.ADMIN_SETUP_KEY || 'setup-admin-120619';
  
  if (setupKey !== expectedKey) {
    return res.status(401).json({ error: 'Invalid setup key' });
  }

  try {
    // Check if any admin already exists
    const existingAdmin = await db.user.findFirst({
      where: { role: 'ADMIN' }
    });

    if (existingAdmin) {
      return res.status(400).json({ 
        error: 'Admin account already exists',
        hint: 'Use the sign-in page with existing credentials'
      });
    }

    // Get credentials from request or use defaults
    const email = req.body.email || env.ADMIN_EMAIL || 'serge@test.com';
    const password = req.body.password || env.ADMIN_PASSWORD || 'Password120619';
    const name = req.body.name || env.ADMIN_NAME || 'Serge Admin';

    // Validate email
    if (!email.includes('@')) {
      return res.status(400).json({ error: 'Invalid email address' });
    }

    // Validate password
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create admin user
    const adminUser = await db.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role: 'ADMIN',
        emailVerified: new Date(),
      },
    });

    // Also create regular user account
    const userEmail = email.replace('@', '.user@');
    await db.user.create({
      data: {
        email: userEmail,
        name: name.replace('Admin', 'User'),
        password: hashedPassword,
        role: 'USER',
        emailVerified: new Date(),
      },
    });

    res.status(200).json({ 
      success: true,
      message: 'Admin account created successfully',
      adminEmail: adminUser.email,
      userEmail: userEmail,
      hint: 'You can now sign in with these credentials'
    });
  } catch (error) {
    console.error('Admin setup error:', error);
    res.status(500).json({ 
      error: 'Failed to create admin account',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}