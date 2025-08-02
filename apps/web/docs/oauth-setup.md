# OAuth Provider Setup Guide

This guide will help you set up OAuth providers for the Holiday Program Aggregator application.

## Prerequisites

1. Copy `.env.local` to `.env`:
   ```bash
   cp .env.local .env
   ```

2. Generate a secure NEXTAUTH_SECRET:
   ```bash
   openssl rand -base64 32
   ```
   Add this to your `.env` file.

## Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to "APIs & Services" > "Credentials"
4. Click "Create Credentials" > "OAuth client ID"
5. Configure the OAuth consent screen if prompted
6. Select "Web application" as the application type
7. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (for development)
   - `https://your-domain.com/api/auth/callback/google` (for production)
8. Copy the Client ID and Client Secret to your `.env` file

## Apple OAuth Setup

1. Go to [Apple Developer Portal](https://developer.apple.com/)
2. Navigate to "Certificates, Identifiers & Profiles"
3. Create a new Service ID:
   - Enable "Sign In with Apple"
   - Configure redirect URLs:
     - `http://localhost:3000/api/auth/callback/apple` (for development)
     - `https://your-domain.com/api/auth/callback/apple` (for production)
4. Create a private key for Sign In with Apple
5. Copy the Service ID and Private Key to your `.env` file

## Discord OAuth Setup

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click "New Application" and give it a name
3. Navigate to the "OAuth2" section
4. Copy the Client ID
5. Reset and copy the Client Secret
6. Add redirect URLs:
   - `http://localhost:3000/api/auth/callback/discord` (for development)
   - `https://your-domain.com/api/auth/callback/discord` (for production)
7. Copy the Client ID and Client Secret to your `.env` file

## Encryption Key Setup

Generate a secure 32-character encryption key:
```bash
openssl rand -hex 16
```

Add this to your `.env` file as `ENCRYPTION_KEY`.

## Testing

1. Restart your development server:
   ```bash
   pnpm dev
   ```

2. Navigate to http://localhost:3000/auth/signin

3. Try signing in with each provider

## Troubleshooting

- **"client_id is required" error**: Ensure the OAuth credentials are properly set in your `.env` file
- **Redirect URI mismatch**: Make sure the redirect URIs in your OAuth provider settings match exactly
- **500 errors**: Check that all required environment variables are set and the server has been restarted