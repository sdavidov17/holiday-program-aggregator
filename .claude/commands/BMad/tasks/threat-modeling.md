# Threat Modeling Task

Execute this task to create or review a threat model for a feature or system.

## Task Configuration

```yaml
task:
  id: threat-modeling
  name: Threat Modeling
  description: STRIDE-based threat modeling for features and systems
  agent: security
  elicit: true
  interactive: true
```

## Execution Instructions

When this task is invoked, follow these steps:

### Step 1: Define Scope

ASK USER: "What feature or system component would you like to threat model?"

After receiving response, gather context:

ASK USER: "Please describe:
1. What does this feature do?
2. What data does it handle?
3. Who are the users/actors?
4. What external systems does it interact with?"

### Step 2: Identify Assets

```
## Asset Identification

### Data Assets
- [ ] User credentials (passwords, tokens)
- [ ] Personal Identifiable Information (PII)
- [ ] Payment information
- [ ] Business-critical data
- [ ] Session data
- [ ] API keys and secrets

### System Assets
- [ ] Database
- [ ] API endpoints
- [ ] Authentication system
- [ ] File storage
- [ ] Third-party integrations

### Trust Boundaries
Identify where trust levels change:
- [ ] Public internet → Application
- [ ] Application → Database
- [ ] Application → Third-party APIs
- [ ] User → Admin
- [ ] Unauthenticated → Authenticated
```

### Step 3: Create Data Flow Diagram

```
## Data Flow Diagram Components

### External Entities (rectangles)
- Users (Parents, Providers, Admins)
- Third-party services (Stripe, Google OAuth)
- Crawled websites

### Processes (circles)
- Authentication service
- API handlers
- Business logic services
- Background jobs

### Data Stores (parallel lines)
- PostgreSQL database
- Session store
- Cache

### Data Flows (arrows)
- User requests
- API responses
- Database queries
- External API calls

### Trust Boundaries (dashed lines)
- DMZ (public endpoints)
- Application tier
- Data tier
- External services
```

Present simplified diagram:
```
┌─────────────┐     HTTPS      ┌─────────────────┐
│   Browser   │◄──────────────►│  Vercel Edge    │
│   (User)    │                │  (CDN + WAF)    │
└─────────────┘                └────────┬────────┘
                                        │
                               ─────────┼───────── Trust Boundary
                                        │
                               ┌────────▼────────┐
                               │   Next.js App   │
                               │  (tRPC + Auth)  │
                               └────────┬────────┘
                                        │
                               ─────────┼───────── Trust Boundary
                                        │
              ┌─────────────────────────┼─────────────────────────┐
              │                         │                         │
     ┌────────▼────────┐     ┌─────────▼─────────┐    ┌──────────▼──────────┐
     │  Neon Postgres  │     │      Stripe       │    │    Google OAuth     │
     │   (Database)    │     │   (Payments)      │    │  (Authentication)   │
     └─────────────────┘     └───────────────────┘    └─────────────────────┘
```

### Step 4: Apply STRIDE Analysis

For each component and data flow, analyze threats:

```
## STRIDE Threat Categories

### S - Spoofing (Identity)
Threat: Attacker pretends to be another user or system
Questions:
- How is identity verified?
- Can authentication be bypassed?
- Are sessions properly managed?

Example threats for this system:
- [ ] Session hijacking
- [ ] OAuth token theft
- [ ] Credential stuffing attacks
- [ ] Man-in-the-middle attacks

Mitigations:
- HTTPS everywhere (HSTS)
- Secure session tokens (HttpOnly, Secure, SameSite)
- Rate limiting on auth endpoints
- MFA for admin accounts
```

```
### T - Tampering (Integrity)
Threat: Attacker modifies data or code
Questions:
- Can request data be modified in transit?
- Are database updates properly authorized?
- Is code integrity verified?

Example threats:
- [ ] Request parameter manipulation
- [ ] IDOR (Insecure Direct Object Reference)
- [ ] SQL injection
- [ ] Webhook payload tampering

Mitigations:
- Input validation (Zod schemas)
- Authorization on all mutations
- Parameterized queries (Prisma)
- Webhook signature verification
```

```
### R - Repudiation (Non-repudiation)
Threat: User denies performing an action
Questions:
- Are actions logged with user context?
- Can logs be tampered with?
- Is there an audit trail?

Example threats:
- [ ] User denies making payment
- [ ] Admin denies modifying data
- [ ] Log tampering

Mitigations:
- Audit logging for all mutations
- Correlation IDs for request tracing
- Immutable log storage
- Timestamp verification
```

```
### I - Information Disclosure (Confidentiality)
Threat: Data exposed to unauthorized parties
Questions:
- Is sensitive data encrypted?
- Are error messages revealing?
- Could data leak through logs?

Example threats:
- [ ] PII exposure in logs
- [ ] Stack traces in production
- [ ] Database exposure
- [ ] API response over-sharing

Mitigations:
- PII encryption at rest
- Sanitized error messages
- Log scrubbing for sensitive data
- Minimal data in API responses
```

```
### D - Denial of Service (Availability)
Threat: System made unavailable
Questions:
- Are there rate limits?
- Can resources be exhausted?
- Is there DDoS protection?

Example threats:
- [ ] API rate limit bypass
- [ ] Database connection exhaustion
- [ ] File upload size attacks
- [ ] Regex DoS (ReDoS)

Mitigations:
- Rate limiting (implemented)
- Connection pooling
- File size limits
- Input length limits
```

```
### E - Elevation of Privilege
Threat: Attacker gains higher privileges
Questions:
- Are role checks enforced server-side?
- Can admin functions be accessed?
- Is there privilege separation?

Example threats:
- [ ] Regular user accessing admin endpoints
- [ ] JWT manipulation for role change
- [ ] Bypassing subscription checks

Mitigations:
- Server-side role verification
- JWT signing verification
- Subscription status check on each request
```

### Step 5: Risk Assessment

```
## Risk Assessment Matrix

| Threat | Likelihood | Impact | Risk Level | Mitigation Status |
|--------|------------|--------|------------|-------------------|
| [Threat 1] | High/Med/Low | High/Med/Low | Critical/High/Med/Low | Mitigated/Partial/None |
| [Threat 2] | ... | ... | ... | ... |

## Risk Calculation
- Critical: High Likelihood + High Impact
- High: High/Med Likelihood + High Impact, or High Likelihood + Med Impact
- Medium: Medium Likelihood + Medium Impact
- Low: Low Likelihood and/or Low Impact
```

### Step 6: Document Findings

```
## Threat Model Document

### Feature/System: [Name]
### Date: [Date]
### Author: [Security Agent]
### Version: 1.0

### 1. Overview
[Brief description of the feature/system]

### 2. Assets
[List of assets identified]

### 3. Data Flow Diagram
[Include diagram or reference]

### 4. Trust Boundaries
[List trust boundaries and their significance]

### 5. Threats Identified
[List of threats from STRIDE analysis]

### 6. Risk Assessment
[Risk matrix with prioritized threats]

### 7. Mitigations
[Current and recommended mitigations]

### 8. Residual Risks
[Risks that remain after mitigations]

### 9. Action Items
[Prioritized list of security improvements]

### 10. Review Schedule
[When this threat model should be reviewed]
```

### Step 7: Action Items

ASK USER: "Would you like me to create GitHub issues for the identified security improvements?"

If yes, create issues with appropriate labels and priority.

## Related Resources

- Security audit task: `security-audit.md`
- OWASP resources: https://owasp.org/www-community/Threat_Modeling
- Architecture docs: `/docs/architecture/`
