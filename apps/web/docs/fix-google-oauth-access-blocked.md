# Fix Google OAuth "Access Blocked" Error

## Steps to Fix in Google Cloud Console

### 1. Configure OAuth Consent Screen
Go to: APIs & Services → OAuth consent screen

**Required fields:**
- App name: "Holiday Program Aggregator" (or your app name)
- User support email: Your email
- Application home page: http://localhost:3000
- Authorized domains: localhost (if it allows)
- Developer contact information: Your email

### 2. Check Publishing Status
On the OAuth consent screen page:
- If status is "Testing": Add your Google account email to "Test users"
- If you want anyone to sign in: Click "PUBLISH APP" (but review is not needed for localhost)

### 3. Verify Scopes
Make sure these scopes are added:
- openid
- email
- profile

### 4. Quick Test
After saving changes in Google Console:

1. Clear your browser cookies for accounts.google.com
2. Try this direct OAuth URL to see the exact error:

```
https://accounts.google.com/o/oauth2/v2/auth?client_id=528339322247-ttnsoicmlunlvbsotr6a68u5cvdddgle.apps.googleusercontent.com&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fapi%2Fauth%2Fcallback%2Fgoogle&response_type=code&scope=openid+email+profile&access_type=offline&prompt=consent
```

### 5. Common Solutions

**If you see "App is in testing mode":**
- Add your email to test users list
- OR publish the app (no review needed for localhost)

**If you see "This app is blocked":**
- Make sure OAuth consent screen is fully configured
- Check that your Google Workspace doesn't block third-party apps

**If you see scope errors:**
- Remove any sensitive scopes you don't need
- Stick to basic: openid, email, profile

### 6. Alternative Quick Fix
If you're just testing locally:
1. Create a new Google Cloud Project
2. Enable Google+ API
3. Create new OAuth credentials
4. Configure minimal OAuth consent screen
5. Update your .env with new credentials