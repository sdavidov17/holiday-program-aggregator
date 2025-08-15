# Epic 4: Security, SRE & Observability
## Story 4.1: Security Headers & CSP Implementation

**Dependencies:** 
- Epic 1, Story 1.1 (Initial Project Setup) - COMPLETED ✅

**Can be implemented:** NOW ✅

*As a security engineer, I want the application to implement comprehensive security headers, so that we protect users from common web vulnerabilities.*

### Acceptance Criteria
1. Implement security headers middleware including:
   - Content Security Policy (CSP) with strict directives
   - X-Frame-Options: DENY
   - X-Content-Type-Options: nosniff
   - Strict-Transport-Security with preload
   - Referrer-Policy: strict-origin-when-cross-origin
2. CSP allows only necessary external resources (Stripe, OAuth providers)
3. Security headers are verified on all responses
4. No console errors from CSP violations in normal operation
5. Security headers score A+ on securityheaders.com

### Development Tasks
- [x] Create Next.js middleware file for security headers implementation
- [x] Configure comprehensive security headers including HSTS, X-Frame-Options, etc.
- [x] Design and implement Content Security Policy with proper directives
- [x] Add exceptions for required external services (Stripe, Google OAuth, Apple OAuth)
- [x] Test CSP in development mode to catch violations early
- [x] Create unit tests to verify headers are present on all responses
- [ ] Test with securityheaders.com and achieve A+ rating
- [x] Document CSP policy and any exceptions with justifications
- [ ] Add CSP violation reporting endpoint for monitoring
- [ ] Configure nonce generation for inline scripts if needed

### Technical Details

#### Security Headers Configuration
```typescript
// middleware.ts
export const securityHeaders = {
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload'
};
```

#### Content Security Policy
```typescript
export const cspHeader = {
  'Content-Security-Policy': `
    default-src 'self';
    script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.stripe.com https://accounts.google.com;
    style-src 'self' 'unsafe-inline';
    img-src 'self' data: https: blob:;
    font-src 'self';
    connect-src 'self' https://api.stripe.com https://*.sentry.io https://accounts.google.com;
    frame-src https://js.stripe.com https://accounts.google.com;
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    upgrade-insecure-requests;
  `.replace(/\s{2,}/g, ' ').trim()
};
```

### Testing Checklist
- [x] Verify all security headers are present on HTML responses
- [x] Verify headers are present on API responses
- [x] Test CSP doesn't block legitimate functionality
- [ ] Verify Stripe payment flow works with CSP (waiting for Stripe integration)
- [ ] Verify OAuth login flows work with CSP (waiting for OAuth integration)
- [x] Check browser console for CSP violations
- [ ] Run security scanner (OWASP ZAP or similar)
- [ ] Achieve A+ rating on securityheaders.com

### Definition of Done
- [x] Security headers middleware implemented and active
- [x] CSP policy configured and tested
- [x] No CSP violations in normal application usage
- [ ] A+ rating achieved on securityheaders.com
- [x] Unit tests passing for header presence
- [x] Documentation updated with security policy
- [x] Code reviewed and approved
- [ ] Deployed to production
