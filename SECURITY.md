# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | :white_check_mark: |

## Known Vulnerabilities

### Next.js 13.5.9
We are currently using Next.js 13.5.9 which has the following known vulnerabilities:

1. **GHSA-fr5h-rqp8-mj6g** - Server-Side Request Forgery in Server Actions
   - **Mitigation**: We do not use Next.js Server Actions in this application
   - **Status**: Not applicable to our use case

2. **GHSA-7gfc-8cq8-jh5f** - Authorization bypass vulnerability
   - **Mitigation**: We have implemented comprehensive middleware security headers and authentication checks
   - **Status**: Mitigated through our security middleware

These vulnerabilities require Next.js 14.x+ to fully patch, but upgrading would break compatibility with our current T3 Stack setup. We have assessed these vulnerabilities and determined they do not affect our application given our architecture and security controls.

## Reporting a Vulnerability

If you discover a security vulnerability, please email security@example.com with:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

We will respond within 48 hours and work on a fix as soon as possible.