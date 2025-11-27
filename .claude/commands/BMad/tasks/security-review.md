# Security Review Task

Execute this task to perform a security-focused code review.

## Task Configuration

```yaml
task:
  id: security-review
  name: Security Code Review
  description: Security-focused review of code changes
  agent: security
  elicit: true
  interactive: true
```

## Execution Instructions

When this task is invoked, follow these steps:

### Step 1: Define Review Scope

ASK USER: "What would you like me to review?"

Present options:
```
1. Specific file(s) - provide file path(s)
2. Recent changes - review uncommitted changes
3. Pull request - review PR changes
4. Feature area - review all files related to a feature
5. Security-sensitive areas - auth, payments, user data
```

### Step 2: Security Review Checklist

For each file or change, verify:

```
## Authentication Security

### Password Handling
- [ ] Passwords never stored in plain text
- [ ] bcrypt/argon2 used with sufficient rounds (12+)
- [ ] Password not logged or included in responses
- [ ] Password reset tokens are single-use and time-limited

### Session Management
- [ ] Session tokens are cryptographically random
- [ ] Tokens have appropriate expiration
- [ ] HttpOnly, Secure, SameSite flags on cookies
- [ ] Session invalidated on logout
- [ ] Session invalidated on password change

### OAuth/Third-Party Auth
- [ ] State parameter validated (CSRF protection)
- [ ] Tokens stored securely
- [ ] Appropriate scopes requested (minimal)
- [ ] Token refresh handled securely
```

```
## Authorization Security

### Access Control
- [ ] Authorization checked on EVERY request (not just UI)
- [ ] Role checks performed server-side
- [ ] Resource ownership verified before access
- [ ] No IDOR vulnerabilities (IDs validated against user)

### tRPC Procedure Security
- [ ] Public procedures are intentionally public
- [ ] Protected procedures verify session
- [ ] Admin procedures verify admin role
- [ ] Premium procedures verify subscription
```

```
## Input Validation

### Request Validation
- [ ] All inputs validated with Zod schemas
- [ ] Validation happens server-side (not just client)
- [ ] Appropriate data types enforced
- [ ] Length limits on string inputs
- [ ] Array size limits where applicable

### File Uploads (if applicable)
- [ ] File type validated (not just extension)
- [ ] File size limited
- [ ] Filename sanitized
- [ ] Stored outside web root
- [ ] No execution permissions
```

```
## Output Security

### XSS Prevention
- [ ] User input escaped in output (React handles this)
- [ ] dangerouslySetInnerHTML not used (or sanitized)
- [ ] CSP headers configured
- [ ] No inline scripts with user data

### Information Disclosure
- [ ] Error messages don't leak stack traces
- [ ] No sensitive data in error responses
- [ ] API responses include only necessary data
- [ ] Debug information not in production
```

```
## Database Security

### Query Safety
- [ ] Parameterized queries used (Prisma)
- [ ] No raw SQL with user input
- [ ] No SQL string concatenation
- [ ] Transaction isolation appropriate

### Data Protection
- [ ] PII encrypted at rest
- [ ] Sensitive data not logged
- [ ] Audit trail for sensitive operations
- [ ] Data retention policies followed
```

```
## API Security

### Endpoint Protection
- [ ] Rate limiting on sensitive endpoints
- [ ] Authentication required where needed
- [ ] CORS configured appropriately
- [ ] No sensitive data in URLs (use POST body)

### Webhook Security
- [ ] Signature verification implemented
- [ ] Replay protection (idempotency)
- [ ] Source IP validation (if applicable)
- [ ] Timeout handling
```

```
## Secrets & Configuration

### Secret Handling
- [ ] No hardcoded secrets or credentials
- [ ] Secrets in environment variables only
- [ ] Different secrets for each environment
- [ ] No secrets in logs or error messages

### Configuration Security
- [ ] Debug mode off in production
- [ ] Secure defaults
- [ ] Feature flags for sensitive features
- [ ] Environment-specific configuration
```

### Step 3: Code Analysis

For security-sensitive code, analyze:

```
## Static Analysis Points

### Authentication Code
Look for:
- Password comparison timing attacks (use constant-time compare)
- Weak password policies
- Missing rate limiting
- Insecure token generation

### Authorization Code
Look for:
- Missing authorization checks
- Authorization bypass logic flaws
- Privilege escalation paths
- IDOR vulnerabilities

### Input Handling
Look for:
- Missing validation
- Type coercion issues
- Injection vulnerabilities
- Path traversal

### Cryptography
Look for:
- Weak algorithms (MD5, SHA1 for passwords)
- Hardcoded keys/IVs
- Insufficient entropy
- Missing integrity checks
```

### Step 4: Findings Documentation

```
## Security Review Findings

### Summary
- Files Reviewed: [count]
- Critical Issues: [count]
- High Issues: [count]
- Medium Issues: [count]
- Low Issues: [count]
- Informational: [count]

### Critical Issues
[Issues requiring immediate attention before merge]

### High Issues
[Issues that should be fixed before production]

### Medium Issues
[Issues that should be addressed in near term]

### Low Issues
[Minor issues or best practice recommendations]

### Positive Findings
[Security measures that are well-implemented]
```

### Step 5: Recommendations

```
## Recommendations Template

### Issue: [Title]
**Severity**: Critical/High/Medium/Low
**Location**: [file:line]
**Description**: [What is the vulnerability]
**Impact**: [What could an attacker do]
**Recommendation**: [How to fix it]
**Example Fix**:
```code
// Before (vulnerable)
[vulnerable code]

// After (secure)
[fixed code]
```
```

### Step 6: Review Completion

ASK USER: "Security review complete. Would you like me to:
1. Create GitHub issues for findings
2. Add inline comments to the code
3. Generate a formal security review document
4. All of the above"

## Quick Reference: Common Vulnerabilities

```
## Red Flags to Watch For

### Immediate Concerns
- eval() with user input
- innerHTML with user data
- SQL string concatenation
- Shell command with user input
- Hardcoded credentials
- Missing auth checks on mutations

### Review Carefully
- Any crypto implementation
- Password/token handling
- File operations with user paths
- URL fetching with user URLs
- Dynamic query construction
- Permission/role checks
```

## Related Resources

- Security audit: `security-audit.md`
- Threat modeling: `threat-modeling.md`
- OWASP Cheat Sheets: https://cheatsheetseries.owasp.org/
