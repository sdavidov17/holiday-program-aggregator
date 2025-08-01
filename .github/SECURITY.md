# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

We take security vulnerabilities seriously. If you discover a security vulnerability within this project, please follow these steps:

1. **DO NOT** open a public issue
2. Email your findings to security@holidayprogram-aggregator.com.au
3. Include the following information:
   - Type of issue (e.g., buffer overflow, SQL injection, XSS, etc.)
   - Full paths of source file(s) related to the issue
   - Location of affected code (tag/branch/commit or direct URL)
   - Step-by-step instructions to reproduce the issue
   - Proof-of-concept or exploit code (if possible)
   - Impact of the issue

## Response Timeline

- **Acknowledgment**: Within 48 hours
- **Initial Assessment**: Within 5 business days
- **Resolution Timeline**: Based on severity
  - Critical: Within 7 days
  - High: Within 14 days
  - Medium: Within 30 days
  - Low: Within 60 days

## Security Measures

This project implements the following security measures:

1. **Dependency Scanning**: Automated via GitHub Dependabot
2. **Security Headers**: Comprehensive CSP and security headers
3. **Authentication**: Secure OAuth 2.0 implementation
4. **Data Protection**: PII scrubbing in logs, encrypted data at rest
5. **Rate Limiting**: Protection against abuse and DDoS
6. **Audit Logging**: Comprehensive authentication event logging

## Disclosure Policy

- Security issues will be disclosed after a fix is available
- Credit will be given to reporters (unless they prefer to remain anonymous)
- We follow responsible disclosure practices