# Epic 4: Security, SRE & Observability
## Story 4.7: Rate Limiting & DDoS Protection

**Dependencies:** 
- Epic 1, Story 1.1 (Initial Project Setup) - COMPLETED ✅
- Epic 1, Story 1.2 (User Account System) - For authenticated user rate limits

**Can be implemented:** Basic rate limiting NOW, enhanced after Story 1.2

*As a security engineer, I want rate limiting on all endpoints, so that we can prevent abuse and ensure service availability.*

### Acceptance Criteria
1. Rate limiting implemented on all API endpoints
2. Different limits for authenticated vs anonymous users
3. Stripe webhook endpoints have appropriate limits
4. Rate limit headers included in responses
5. Cloudflare DDoS protection enabled
6. Alerts for unusual traffic patterns

### Development Tasks
- [ ] Implement rate limiting middleware
- [ ] Configure per-endpoint rate limits
- [ ] Set up Redis for distributed rate limiting
- [ ] Add rate limit headers to responses
- [ ] Configure different tiers for auth/unauth users
- [ ] Protect Stripe webhooks appropriately
- [ ] Set up Cloudflare DDoS protection
- [ ] Create traffic monitoring dashboards
- [ ] Implement rate limit bypass for admins
- [ ] Add rate limit metrics collection

### Technical Details

#### Rate Limiting Middleware
```typescript
// middleware/rateLimit.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { NextRequest, NextResponse } from 'next/server';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

// Different rate limiters for different use cases
const limiters = {
  // Anonymous users: 10 requests per minute
  anonymous: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, '1 m'),
    analytics: true,
  }),
  
  // Authenticated users: 100 requests per minute
  authenticated: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(100, '1 m'),
    analytics: true,
  }),
  
  // Auth endpoints: 5 attempts per 15 minutes
  auth: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, '15 m'),
    analytics: true,
  }),
  
  // Search API: 30 requests per minute
  search: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(30, '1 m'),
    analytics: true,
  }),
  
  // Stripe webhooks: 100 per minute
  webhook: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(100, '1 m'),
    analytics: true,
  }),
};

export async function rateLimitMiddleware(request: NextRequest) {
  const ip = request.ip || 'unknown';
  const path = request.nextUrl.pathname;
  const isAuthenticated = !!request.cookies.get('next-auth.session-token');
  
  // Determine which limiter to use
  let limiter;
  let identifier = ip;
  
  if (path.startsWith('/api/auth/')) {
    limiter = limiters.auth;
  } else if (path.startsWith('/api/webhook/')) {
    limiter = limiters.webhook;
  } else if (path.startsWith('/api/search')) {
    limiter = limiters.search;
  } else if (isAuthenticated) {
    limiter = limiters.authenticated;
    // Use user ID for authenticated users if available
    const userId = await getUserIdFromSession(request);
    if (userId) identifier = userId;
  } else {
    limiter = limiters.anonymous;
  }
  
  // Check rate limit
  const { success, limit, reset, remaining } = await limiter.limit(identifier);
  
  // Add rate limit headers
  const response = success
    ? NextResponse.next()
    : NextResponse.json(
        { error: 'Too many requests' },
        { status: 429 }
      );
  
  response.headers.set('X-RateLimit-Limit', limit.toString());
  response.headers.set('X-RateLimit-Remaining', remaining.toString());
  response.headers.set('X-RateLimit-Reset', new Date(reset).toISOString());
  
  // Log rate limit violations
  if (!success) {
    await logRateLimitViolation({
      identifier,
      path,
      ip,
      isAuthenticated,
    });
  }
  
  return response;
}
```

#### Endpoint-Specific Configuration
```typescript
// config/rateLimits.ts
export const RATE_LIMITS = {
  // Public endpoints
  '/api/health/live': { limit: 60, window: '1m' },
  '/api/health/ready': { limit: 60, window: '1m' },
  
  // Auth endpoints
  '/api/auth/signin': { limit: 5, window: '15m' },
  '/api/auth/signup': { limit: 3, window: '1h' },
  '/api/auth/reset-password': { limit: 3, window: '1h' },
  
  // API endpoints
  '/api/trpc/search.findPrograms': { limit: 30, window: '1m' },
  '/api/trpc/payment.createSubscription': { limit: 5, window: '15m' },
  '/api/trpc/user.updatePreferences': { limit: 10, window: '5m' },
  
  // Admin endpoints
  '/api/admin/*': { limit: 100, window: '1m', requireAuth: true },
  
  // Webhook endpoints
  '/api/webhook/stripe': { limit: 100, window: '1m', skipAuth: true },
};
```

#### Cloudflare Configuration
```typescript
// cloudflare-config.json
{
  "security_level": "medium",
  "challenge_ttl": 86400,
  "browser_check": "on",
  "rate_limiting": [
    {
      "threshold": 50,
      "period": 60,
      "action": "challenge"
    },
    {
      "threshold": 100,
      "period": 60,
      "action": "block"
    }
  ],
  "firewall_rules": [
    {
      "expression": "(http.request.uri.path contains \"/api/\" and cf.threat_score gt 30)",
      "action": "challenge"
    },
    {
      "expression": "(http.request.uri.path contains \"/admin/\" and not ip.geoip.country in {\"AU\"})",
      "action": "block"
    }
  ]
}
```

#### Traffic Monitoring
```typescript
// monitoring/traffic.ts
export async function monitorTrafficPatterns() {
  const metrics = {
    requestsPerMinute: await getRequestRate(),
    uniqueIPs: await getUniqueIPs(),
    topEndpoints: await getTopEndpoints(),
    suspiciousPatterns: await detectAnomalies(),
  };
  
  // Alert on suspicious patterns
  if (metrics.suspiciousPatterns.length > 0) {
    await alertSecurityTeam({
      type: 'suspicious_traffic',
      patterns: metrics.suspiciousPatterns,
      metrics,
    });
  }
  
  // Auto-block severe threats
  for (const threat of metrics.suspiciousPatterns) {
    if (threat.severity === 'high') {
      await blockIP(threat.ip, '24h', threat.reason);
    }
  }
}
```

#### Admin Bypass
```typescript
// middleware/adminBypass.ts
export async function checkAdminBypass(request: NextRequest): Promise<boolean> {
  const session = await getServerSession(request);
  
  if (session?.user?.role === 'admin') {
    // Verify admin token for extra security
    const adminToken = request.headers.get('X-Admin-Token');
    if (adminToken && await verifyAdminToken(adminToken)) {
      return true;
    }
  }
  
  return false;
}
```

### Testing Checklist
- [ ] Verify rate limits work for anonymous users
- [ ] Test authenticated users get higher limits
- [ ] Verify auth endpoints have strict limits
- [ ] Test rate limit headers are included
- [ ] Verify Redis stores rate limit data
- [ ] Test Cloudflare rules don't block legitimate traffic
- [ ] Verify admin bypass works correctly
- [ ] Test webhook endpoints aren't over-limited

### Definition of Done
- [ ] Rate limiting middleware implemented
- [ ] Redis configured for distributed limits
- [ ] Per-endpoint limits configured
- [ ] Rate limit headers added to responses
- [ ] Cloudflare DDoS protection enabled
- [ ] Traffic monitoring dashboards created
- [ ] Alert rules configured
- [ ] Documentation updated
- [ ] Code reviewed and approved
- [ ] Deployed to production
