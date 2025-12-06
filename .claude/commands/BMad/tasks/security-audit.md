# Security Audit Task

Execute this task to perform a comprehensive security audit against OWASP Top 10.

## Task Configuration

```yaml
task:
  id: security-audit
  name: Security Audit
  description: Comprehensive security audit against OWASP Top 10
  agent: security
  elicit: true
  interactive: true
```

## Execution Instructions

When this task is invoked, follow these steps:

### Step 1: Audit Scope

ASK USER: "What is the scope of this security audit?"

Present options:
```
1. Full Application Audit (comprehensive, all OWASP Top 10)
2. Pre-Release Security Review (focused on changes)
3. Authentication & Authorization Review
4. Input Validation & Injection Review
5. Dependency Vulnerability Scan
6. Specific Feature Audit (specify feature)
```

### Step 2: OWASP Top 10 Checklist

For each category, verify and document findings:

```
## A01:2021 - Broken Access Control

### Verification Steps
- [ ] All API endpoints require authentication (except public)
- [ ] Authorization checked on every request (not just frontend)
- [ ] No IDOR vulnerabilities (object references validated)
- [ ] Admin functions protected with role checks
- [ ] Resource ownership verified before access

### Files to Review
- apps/web/src/server/api/trpc.ts (procedure definitions)
- apps/web/src/server/api/routers/*.ts (authorization logic)
- apps/web/src/middleware.ts (route protection)

### Tests to Run
pnpm test -- --grep "access control"
```

```
## A02:2021 - Cryptographic Failures

### Verification Steps
- [ ] Passwords hashed with bcrypt (12+ rounds)
- [ ] PII encrypted at rest (AES encryption)
- [ ] HTTPS enforced (HSTS enabled)
- [ ] Sensitive data not logged
- [ ] Encryption keys in environment variables only

### Files to Review
- apps/web/src/utils/encryption.ts
- apps/web/src/server/auth.ts (password handling)
- apps/web/src/middleware.ts (HSTS header)

### Tests to Run
pnpm test -- --grep "cryptograph"
```

```
## A03:2021 - Injection

### Verification Steps
- [ ] All database queries use Prisma (parameterized)
- [ ] User input validated with Zod schemas
- [ ] No dynamic SQL construction
- [ ] XSS prevented (React escapes by default + CSP)
- [ ] Command injection prevented (no shell exec with user input)

### Files to Review
- apps/web/src/repositories/*.ts
- apps/web/src/server/api/routers/*.ts (input validation)
- apps/web/src/middleware.ts (CSP headers)

### Tests to Run
pnpm test -- --grep "injection"
```

```
## A04:2021 - Insecure Design

### Verification Steps
- [ ] Threat model exists and is current
- [ ] Business logic constraints enforced server-side
- [ ] Rate limiting on sensitive operations
- [ ] Fail-secure defaults (deny by default)
- [ ] No race conditions in critical operations

### Files to Review
- apps/web/src/lib/rate-limiter.ts
- apps/web/src/services/*.ts (business logic)

### Tests to Run
pnpm test -- --grep "security"
```

```
## A05:2021 - Security Misconfiguration

### Verification Steps
- [ ] Security headers configured (CSP, X-Frame-Options, etc.)
- [ ] Debug endpoints disabled in production
- [ ] Error messages don't leak stack traces
- [ ] Default credentials changed
- [ ] Unnecessary features disabled

### Files to Review
- apps/web/src/middleware.ts
- apps/web/next.config.js

### Commands to Run
# Check security headers
curl -I https://[production-url] | grep -i "x-frame\|x-content\|strict-transport\|content-security"
```

```
## A06:2021 - Vulnerable and Outdated Components

### Verification Steps
- [ ] No critical npm audit vulnerabilities
- [ ] Dependencies regularly updated (Dependabot active)
- [ ] No GPL/AGPL licensed components (unless approved)
- [ ] Known vulnerable versions not in use

### Commands to Run
npm audit
npm outdated
```

```
## A07:2021 - Identification and Authentication Failures

### Verification Steps
- [ ] Password policy enforced (minimum length, complexity)
- [ ] Rate limiting on login (5 attempts/15 min)
- [ ] Session tokens cryptographically random
- [ ] Session expiration configured
- [ ] MFA available for admin accounts

### Files to Review
- apps/web/src/server/auth.ts
- apps/web/src/lib/rate-limiter.ts
- apps/web/src/pages/api/auth/*.ts

### Tests to Run
pnpm test -- --grep "auth"
```

```
## A08:2021 - Software and Data Integrity Failures

### Verification Steps
- [ ] Webhook signatures verified (Stripe)
- [ ] CI/CD pipeline secured
- [ ] Dependency integrity verified (lockfile)
- [ ] No unsafe deserialization
- [ ] File uploads validated and sanitized

### Files to Review
- apps/web/src/pages/api/stripe/webhook.ts
- .github/workflows/*.yml

### Tests to Run
pnpm test -- --grep "webhook"
```

```
## A09:2021 - Security Logging and Monitoring Failures

### Verification Steps
- [ ] Authentication events logged
- [ ] Authorization failures logged
- [ ] Security events include correlation IDs
- [ ] Logs don't contain sensitive data
- [ ] Alerting configured for suspicious activity

### Files to Review
- apps/web/src/utils/logger.ts (if exists)
- apps/web/src/lib/audit-logger.ts (if exists)

### Recommendations
- Implement structured logging with Pino
- Add security event logging
- Configure alerting for failed auth attempts
```

```
## A10:2021 - Server-Side Request Forgery (SSRF)

### Verification Steps
- [ ] URL inputs validated (allowlist if possible)
- [ ] No internal network access from user input
- [ ] Webhook URLs restricted to HTTPS
- [ ] DNS rebinding protection in place

### Files to Review
- Any code that fetches external URLs
- Webhook configuration endpoints
```

### Step 3: Automated Scans

```
## Automated Security Scans

### Dependency Scan
npm audit --json > security-audit-deps.json

### Secret Scan (if TruffleHog available)
trufflehog git file://. --json > security-audit-secrets.json

### Static Analysis
# CodeQL runs in CI, review recent results in GitHub Security tab

### Security Headers Check
# Use securityheaders.com or similar for production URL
```

### Step 4: Findings Report

```
## Security Audit Report Template

### Executive Summary
- Audit Date: [Date]
- Scope: [Full/Partial]
- Overall Risk Level: [Critical/High/Medium/Low]
- Total Findings: [X Critical, Y High, Z Medium, W Low]

### Critical Findings
[List any critical security issues requiring immediate attention]

### High Priority Findings
[List high priority issues for near-term resolution]

### Medium Priority Findings
[List medium priority issues for planned resolution]

### Low Priority Findings
[List low priority issues and recommendations]

### Recommendations
1. [Prioritized list of remediation actions]

### Appendix
- Tools used
- Files reviewed
- Tests executed
```

### Step 5: Remediation Tracking

ASK USER: "Would you like me to create GitHub issues for the findings?"

If yes, create issues with:
- Security label
- Severity in title (e.g., "[SECURITY-HIGH] Description")
- Reproduction steps if applicable
- Remediation recommendations

## Related Resources

- Security tests: `apps/web/src/__tests__/security/`
- SECURITY.md: Vulnerability reporting process
- Security scan workflow: `.github/workflows/security-scan.yml`
