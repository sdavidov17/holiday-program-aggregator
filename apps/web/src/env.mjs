import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const env = createEnv({
  /**
   * Specify your server-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars.
   */
  server: {
    DATABASE_URL: z
      .string()
      .refine((str) => {
        // Allow both standard URLs and PostgreSQL connection strings
        try {
          new URL(str);
          return true;
        } catch {
          // Check if it's a valid PostgreSQL connection string
          return (
            str.startsWith('postgresql://') ||
            str.startsWith('postgres://') ||
            str.startsWith('file:')
          ); // SQLite
        }
      }, 'Invalid database URL')
      .refine(
        (str) => !str.includes('YOUR_MYSQL_URL_HERE'),
        'You forgot to change the default URL',
      ),
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    NEXTAUTH_SECRET:
      process.env.NODE_ENV === 'production' ? z.string().min(1) : z.string().min(1).optional(),
    NEXTAUTH_URL: z.preprocess(
      // This makes Vercel deployments not fail if you don't set NEXTAUTH_URL
      // Since NextAuth.js automatically uses the VERCEL_URL if present.
      (str) => process.env.VERCEL_URL ?? str,
      // VERCEL_URL doesn't include `https` so it cant be validated as a URL
      process.env.VERCEL ? z.string().min(1) : z.string().url(),
    ),
    // Add `.min(1) on ID and SECRET if you want to make sure they're not empty
    DISCORD_CLIENT_ID: z.string().optional(),
    DISCORD_CLIENT_SECRET: z.string().optional(),
    GOOGLE_CLIENT_ID: z.string().optional(),
    GOOGLE_CLIENT_SECRET: z.string().optional(),
    APPLE_ID: z.string().optional(),
    APPLE_SECRET: z.string().optional(),
    ENCRYPTION_KEY: z.string().min(32).optional(),
    // Stripe
    STRIPE_SECRET_KEY: z.string().optional(),
    STRIPE_WEBHOOK_SECRET: z.string().optional(),
    STRIPE_ANNUAL_PRICE_ID: z.string().optional(),
    // Cron and Email
    CRON_SECRET: z.string().optional(),
    RESEND_API_KEY: z.string().optional(),
    // Admin Setup
    ADMIN_EMAIL: z.string().optional(),
    ADMIN_PASSWORD: z.string().optional(),
    ADMIN_NAME: z.string().optional(),
    ADMIN_SETUP_KEY: z.string().optional(),
    // Feature Flags (server-only for security-sensitive features)
    FEATURE_AGENT_ENABLED: z
      .enum(['true', 'false'])
      .default('false')
      .transform((val) => val === 'true'),
    FEATURE_CHECKLY_ENABLED: z
      .enum(['true', 'false'])
      .default('false')
      .transform((val) => val === 'true'),
  },

  /**
   * Specify your client-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars. To expose them to the client, prefix them with
   * `NEXT_PUBLIC_`.
   */
  client: {
    // NEXT_PUBLIC_CLIENTVAR: z.string().min(1),
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().optional(),
    // Feature Flags (client-accessible)
    NEXT_PUBLIC_FEATURE_RUM_ENABLED: z
      .enum(['true', 'false'])
      .default('false')
      .transform((val) => val === 'true'),
  },

  /**
   * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
   * middlewares) or client-side so we need to destruct manually.
   */
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    NODE_ENV: process.env.NODE_ENV,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    DISCORD_CLIENT_ID: process.env.DISCORD_CLIENT_ID,
    DISCORD_CLIENT_SECRET: process.env.DISCORD_CLIENT_SECRET,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    APPLE_ID: process.env.APPLE_ID,
    APPLE_SECRET: process.env.APPLE_SECRET,
    ENCRYPTION_KEY: process.env.ENCRYPTION_KEY,
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
    STRIPE_ANNUAL_PRICE_ID: process.env.STRIPE_ANNUAL_PRICE_ID,
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    CRON_SECRET: process.env.CRON_SECRET,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    ADMIN_EMAIL: process.env.ADMIN_EMAIL,
    ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
    ADMIN_NAME: process.env.ADMIN_NAME,
    ADMIN_SETUP_KEY: process.env.ADMIN_SETUP_KEY,
    // Feature Flags
    FEATURE_AGENT_ENABLED: process.env.FEATURE_AGENT_ENABLED,
    FEATURE_CHECKLY_ENABLED: process.env.FEATURE_CHECKLY_ENABLED,
    NEXT_PUBLIC_FEATURE_RUM_ENABLED: process.env.NEXT_PUBLIC_FEATURE_RUM_ENABLED,
  },
  /**
   * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially
   * useful for Docker builds.
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  /**
   * Makes it so that empty strings are treated as undefined.
   * `SOME_VAR: z.string()` and `SOME_VAR=''` will throw an error.
   */
  emptyStringAsUndefined: true,
});
