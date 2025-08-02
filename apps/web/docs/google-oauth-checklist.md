# Google OAuth Configuration Checklist

## Fix the 401 Invalid Client Error

### 1. Verify Redirect URIs in Google Cloud Console

Go to [Google Cloud Console](https://console.cloud.google.com/) → APIs & Services → Credentials → Your OAuth 2.0 Client ID

Add ALL of these Authorized redirect URIs (exact match required):
- `http://localhost:3000/api/auth/callback/google`
- `http://localhost:3001/api/auth/callback/google` (in case port changes)
- `http://127.0.0.1:3000/api/auth/callback/google`

**Important**: The redirect URI must match EXACTLY, including:
- Protocol (http vs https)
- Domain (localhost vs 127.0.0.1)
- Port (3000)
- Path (/api/auth/callback/google)

### 2. Verify OAuth Consent Screen

In Google Cloud Console → APIs & Services → OAuth consent screen:
- Ensure it's configured (even for testing)
- Add your email to test users if in "Testing" mode
- Check publishing status

### 3. Verify Credentials

Double-check in your `.env` file:
- `GOOGLE_CLIENT_ID` - Should end with `.apps.googleusercontent.com`
- `GOOGLE_CLIENT_SECRET` - Should start with `GOCSPX-`

### 4. Check Application Type

In Google Cloud Console, verify your OAuth client is:
- Type: "Web application" (NOT "Desktop" or other types)

### 5. Clear Browser Cache

Sometimes OAuth errors are cached:
1. Open Chrome DevTools (F12)
2. Right-click the refresh button
3. Select "Empty Cache and Hard Reload"

### 6. Test with Console Logs

Add this temporary debug code to see what's being sent:

```javascript
// In src/server/auth.ts, update GoogleProvider:
GoogleProvider({
  clientId: env.GOOGLE_CLIENT_ID ?? "",
  clientSecret: env.GOOGLE_CLIENT_SECRET ?? "",
  authorization: {
    params: {
      prompt: "consent",
      access_type: "offline",
      response_type: "code"
    }
  }
}),
```

### Common Solutions:

1. **Most Common Fix**: Add the exact redirect URI to Google Console
2. **Second Most Common**: Wrong OAuth client type (should be "Web application")
3. **Third**: Spaces or hidden characters in the .env file values

### Quick Test:

After making changes:
1. Save changes in Google Cloud Console
2. Restart your Next.js server
3. Clear browser cache
4. Try signing in again