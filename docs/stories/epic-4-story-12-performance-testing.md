# Epic 4: Security, SRE & Observability
## Story 4.12: Performance Testing & Optimization

**Dependencies:** 
- Epic 1 (all stories) - Need auth, payments to test
- Epic 2 (Search) - Need search functionality to test
- Epic 4, Story 4.3 (OpenTelemetry) - For performance metrics

**Can be implemented:** After MVP features are complete

*As a performance engineer, I want load testing for critical paths, so that we ensure the system meets performance requirements.*

### Acceptance Criteria
1. Load tests simulate 500 concurrent users
2. Search functionality maintains <500ms P95 under load
3. Payment processing maintains 99.5% success under load
4. Performance regression tests in CI/CD
5. Database query performance monitored
6. CDN cache hit rates optimized >90%

### Development Tasks
- [ ] Set up load testing infrastructure
- [ ] Create load test scenarios
- [ ] Implement performance regression tests
- [ ] Optimize database queries
- [ ] Configure CDN caching rules
- [ ] Set up performance monitoring
- [ ] Create performance dashboards
- [ ] Implement auto-scaling rules
- [ ] Document performance baselines
- [ ] Build performance budget system

### Technical Details

#### Load Testing Framework
```typescript
// loadtests/framework.ts
import { check, sleep } from 'k6';
import http from 'k6/http';
import { Rate, Trend } from 'k6/metrics';

// Custom metrics
const searchLatency = new Trend('search_latency');
const searchErrors = new Rate('search_errors');
const paymentSuccess = new Rate('payment_success');

export const options = {
  stages: [
    { duration: '2m', target: 50 },   // Ramp up to 50 users
    { duration: '5m', target: 100 },  // Ramp up to 100 users
    { duration: '10m', target: 500 }, // Ramp up to 500 users
    { duration: '5m', target: 500 },  // Stay at 500 users
    { duration: '2m', target: 0 },    // Ramp down
  ],
  thresholds: {
    'http_req_duration{scenario:search}': ['p(95)<500'], // 95% under 500ms
    'http_req_duration{scenario:payment}': ['p(95)<3000'], // 95% under 3s
    'search_errors': ['rate<0.01'], // Less than 1% error rate
    'payment_success': ['rate>0.995'], // Greater than 99.5% success
  },
};
```

#### Search Performance Test
```typescript
// loadtests/scenarios/search.ts
export function searchScenario() {
  const locations = ['2000', '2001', '2010', '2020', '2030']; // Sydney postcodes
  const ageGroups = ['0-2', '3-4', '5-7', '8-12', '13-17'];
  
  // Random search parameters
  const location = locations[Math.floor(Math.random() * locations.length)];
  const ageGroup = ageGroups[Math.floor(Math.random() * ageGroups.length)];
  
  const params = {
    headers: {
      'Content-Type': 'application/json',
      'X-Load-Test': 'true', // Identify load test traffic
    },
    tags: { scenario: 'search' },
  };
  
  // Perform search
  const searchStart = Date.now();
  const response = http.post(
    `${__ENV.BASE_URL}/api/trpc/search.findPrograms`,
    JSON.stringify({
      json: {
        location,
        ageGroup,
        radius: 10,
      },
    }),
    params
  );
  
  const latency = Date.now() - searchStart;
  searchLatency.add(latency);
  
  // Validate response
  const success = check(response, {
    'status is 200': (r) => r.status === 200,
    'has results': (r) => {
      const body = JSON.parse(r.body);
      return body.result?.data?.programs?.length > 0;
    },
    'latency under 500ms': () => latency < 500,
  });
  
  searchErrors.add(!success);
  
  // Think time
  sleep(Math.random() * 3 + 2); // 2-5 seconds
}
```

#### Payment Processing Test
```typescript
// loadtests/scenarios/payment.ts
export function paymentScenario() {
  // First, authenticate
  const loginResponse = http.post(
    `${__ENV.BASE_URL}/api/auth/callback/credentials`,
    JSON.stringify({
      email: `loadtest-${__VU}@test.holiday-aggregator.com`,
      password: __ENV.LOAD_TEST_PASSWORD,
    })
  );
  
  const token = loginResponse.cookies['next-auth.session-token'][0].value;
  
  // Create payment intent
  const paymentResponse = http.post(
    `${__ENV.BASE_URL}/api/trpc/payment.createSubscription`,
    JSON.stringify({
      json: {
        priceId: __ENV.TEST_PRICE_ID,
        testMode: true,
      },
    }),
    {
      headers: {
        'Cookie': `next-auth.session-token=${token}`,
        'X-Load-Test': 'true',
      },
      tags: { scenario: 'payment' },
    }
  );
  
  const success = check(paymentResponse, {
    'payment created': (r) => r.status === 200,
    'has client secret': (r) => {
      const body = JSON.parse(r.body);
      return body.result?.data?.clientSecret !== undefined;
    },
  });
  
  paymentSuccess.add(success);
  
  sleep(5); // Longer think time for payment flow
}
```

#### Database Query Optimization
```typescript
// utils/queryOptimizer.ts
export class QueryOptimizer {
  async analyzeSlowQueries() {
    // Get slow queries from Prisma logs
    const slowQueries = await db.$queryRaw`
      SELECT
        query,
        mean_exec_time,
        calls,
        total_exec_time
      FROM pg_stat_statements
      WHERE mean_exec_time > 100 -- queries taking >100ms
      ORDER BY mean_exec_time DESC
      LIMIT 20
    `;
    
    return slowQueries;
  }
  
  async addMissingIndexes() {
    // Analyze query patterns and suggest indexes
    const suggestions = await db.$queryRaw`
      SELECT
        schemaname,
        tablename,
        attname,
        n_distinct,
        correlation
      FROM pg_stats
      WHERE schemaname = 'public'
        AND n_distinct > 100
        AND correlation < 0.1
      ORDER BY n_distinct DESC
    `;
    
    // Generate index creation statements
    return suggestions.map(s => ({
      table: s.tablename,
      column: s.attname,
      sql: `CREATE INDEX idx_${s.tablename}_${s.attname} ON ${s.tablename} (${s.attname})`,
    }));
  }
}

// Optimized search query with spatial index
export async function optimizedProgramSearch(params: SearchParams) {
  const { location, radius, ageGroup } = params;
  
  // Use PostGIS for efficient spatial queries
  return await db.$queryRaw`
    SELECT
      p.*,
      ST_Distance(p.location, ST_MakePoint(${location.lng}, ${location.lat})::geography) as distance
    FROM programs p
    WHERE
      ST_DWithin(
        p.location,
        ST_MakePoint(${location.lng}, ${location.lat})::geography,
        ${radius * 1000} -- Convert km to meters
      )
      AND p.age_min <= ${ageGroup.max}
      AND p.age_max >= ${ageGroup.min}
      AND p.status = 'active'
    ORDER BY distance
    LIMIT 50
  `;
}
```

#### CDN Configuration
```typescript
// config/cdn.ts
export const CDN_RULES = {
  // Static assets - cache forever
  '/_next/static/*': {
    'Cache-Control': 'public, immutable, max-age=31536000',
  },
  
  // Images - cache for a week
  '/images/*': {
    'Cache-Control': 'public, max-age=604800, stale-while-revalidate=86400',
  },
  
  // API responses - cache based on endpoint
  '/api/trpc/public.getPrograms': {
    'Cache-Control': 'public, max-age=300, stale-while-revalidate=60',
    'Vary': 'Accept-Encoding, X-Location',
  },
  
  '/api/trpc/public.getProviders': {
    'Cache-Control': 'public, max-age=3600, stale-while-revalidate=300',
  },
  
  // Health checks - no cache
  '/api/health/*': {
    'Cache-Control': 'no-cache, no-store, must-revalidate',
  },
};

// Edge function for cache key generation
export function generateCacheKey(request: Request): string {
  const url = new URL(request.url);
  const location = request.headers.get('X-Location') || 'default';
  
  // Include location in cache key for search results
  if (url.pathname.includes('search')) {
    return `${url.pathname}:${location}:${url.searchParams.toString()}`;
  }
  
  return `${url.pathname}:${url.searchParams.toString()}`;
}
```

#### Performance Monitoring
```typescript
// monitoring/performance.ts
export class PerformanceMonitor {
  private metrics = {
    apiLatency: new Histogram({
      name: 'api_request_duration_ms',
      help: 'API request duration in milliseconds',
      labelNames: ['method', 'endpoint', 'status'],
      buckets: [10, 50, 100, 250, 500, 1000, 2500, 5000],
    }),
    
    dbQueryTime: new Histogram({
      name: 'db_query_duration_ms',
      help: 'Database query duration in milliseconds',
      labelNames: ['operation', 'model'],
      buckets: [1, 5, 10, 25, 50, 100, 250, 500],
    }),
    
    cacheHitRate: new Gauge({
      name: 'cache_hit_rate',
      help: 'CDN cache hit rate',
      labelNames: ['endpoint'],
    }),
  };
  
  recordApiLatency(endpoint: string, duration: number, status: number) {
    this.metrics.apiLatency
      .labels({ endpoint, status: status.toString() })
      .observe(duration);
  }
  
  async checkPerformanceBudget() {
    const budgets = {
      'search.findPrograms': { p95: 500, p99: 1000 },
      'payment.createSubscription': { p95: 3000, p99: 5000 },
      'auth.login': { p95: 1000, p99: 2000 },
    };
    
    for (const [endpoint, limits] of Object.entries(budgets)) {
      const metrics = await this.getEndpointMetrics(endpoint);
      
      if (metrics.p95 > limits.p95 || metrics.p99 > limits.p99) {
        await this.alertPerformanceDegradation({
          endpoint,
          metrics,
          limits,
        });
      }
    }
  }
}
```

#### Performance Regression Tests
```typescript
// tests/performance/regression.test.ts
describe('Performance Regression Tests', () => {
  const PERFORMANCE_BUDGETS = {
    searchPrograms: 500,      // ms
    loadProgramDetails: 300,  // ms
    createSubscription: 3000, // ms
  };
  
  it('search programs should complete under budget', async () => {
    const start = performance.now();
    
    const result = await api.search.findPrograms.query({
      location: '2000',
      radius: 10,
      ageGroup: '5-7',
    });
    
    const duration = performance.now() - start;
    
    expect(duration).toBeLessThan(PERFORMANCE_BUDGETS.searchPrograms);
    expect(result.programs).toHaveLength(greaterThan(0));
  });
  
  it('should handle concurrent requests efficiently', async () => {
    const concurrentRequests = 10;
    const requests = Array(concurrentRequests).fill(null).map(() => 
      api.search.findPrograms.query({
        location: '2000',
        radius: 10,
      })
    );
    
    const start = performance.now();
    const results = await Promise.all(requests);
    const totalDuration = performance.now() - start;
    
    // Should not take 10x longer for 10 concurrent requests
    expect(totalDuration).toBeLessThan(PERFORMANCE_BUDGETS.searchPrograms * 3);
    expect(results).toHaveLength(concurrentRequests);
  });
});
```

### Testing Checklist
- [ ] Load tests run successfully with 500 users
- [ ] Search maintains <500ms P95 latency
- [ ] Payment success rate >99.5% under load
- [ ] No memory leaks during extended tests
- [ ] Database connection pool handles load
- [ ] CDN cache hit rate >90%
- [ ] Auto-scaling triggers appropriately
- [ ] Performance budgets enforced

### Definition of Done
- [ ] Load testing infrastructure deployed
- [ ] All scenarios implemented and passing
- [ ] Database queries optimized
- [ ] CDN caching configured
- [ ] Performance monitoring active
- [ ] Regression tests in CI/CD
- [ ] Performance dashboards created
- [ ] Auto-scaling configured
- [ ] Documentation completed
- [ ] Team trained on tools
