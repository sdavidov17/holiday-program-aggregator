# Epic 4: Security, SRE & Observability
## Story 4.3: OpenTelemetry Distributed Tracing

**Dependencies:** 
- Epic 1, Story 1.1 (Initial Project Setup) - COMPLETED ✅
- Epic 4, Story 4.2 (Structured Logging) - Should be completed first for correlation ID integration

**Can be implemented:** After Story 4.2

*As an SRE, I want distributed tracing across all services, so that I can identify performance bottlenecks and debug issues quickly.*

### Acceptance Criteria
1. OpenTelemetry SDK integrated in Next.js application
2. All API endpoints create trace spans
3. Database queries included in traces with sanitized queries
4. External API calls (Stripe, email) included in traces
5. Traces exported to observability platform
6. P95 latency dashboards available for all endpoints

### Development Tasks
- [ ] Install OpenTelemetry packages for Node.js
- [ ] Create instrumentation configuration file
- [ ] Set up OTLP exporter for trace data
- [ ] Instrument tRPC procedures automatically
- [ ] Add Prisma instrumentation for database queries
- [ ] Instrument external HTTP calls (Stripe, email)
- [ ] Configure trace sampling rates
- [ ] Create custom spans for business logic
- [ ] Set up trace context propagation
- [ ] Create performance dashboards in observability platform

### Technical Details

#### OpenTelemetry Setup
```typescript
// instrumentation.ts
import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http';

const resource = new Resource({
  [SemanticResourceAttributes.SERVICE_NAME]: 'holiday-aggregator',
  [SemanticResourceAttributes.SERVICE_VERSION]: process.env.NEXT_PUBLIC_VERSION || '1.0.0',
  [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: process.env.NODE_ENV,
});

const traceExporter = new OTLPTraceExporter({
  url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT + '/v1/traces',
  headers: {
    'api-key': process.env.OTEL_API_KEY,
  },
});

const metricExporter = new OTLPMetricExporter({
  url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT + '/v1/metrics',
  headers: {
    'api-key': process.env.OTEL_API_KEY,
  },
});

const sdk = new NodeSDK({
  resource,
  traceExporter,
  metricReader: new PeriodicExportingMetricReader({
    exporter: metricExporter,
    exportIntervalMillis: 10000,
  }),
  instrumentations: [
    getNodeAutoInstrumentations({
      '@opentelemetry/instrumentation-fs': {
        enabled: false, // Too noisy
      },
    }),
  ],
});

sdk.start();
```

#### tRPC Instrumentation
```typescript
// server/api/trpc.ts
import { trace, context, SpanStatusCode } from '@opentelemetry/api';

const tracer = trace.getTracer('trpc');

export const createTRPCContext = async (opts: CreateNextContextOptions) => {
  const span = tracer.startSpan('createTRPCContext');
  
  try {
    // Existing context creation
    const session = await getServerAuthSession(opts);
    
    span.setAttributes({
      'user.authenticated': !!session,
      'user.id': session?.user?.id || 'anonymous',
    });
    
    return {
      session,
      db,
      span,
    };
  } finally {
    span.end();
  }
};

// Middleware to wrap procedures in spans
const tracingMiddleware = t.middleware(async ({ path, next, ctx }) => {
  const span = tracer.startSpan(`trpc.${path}`, {
    attributes: {
      'rpc.method': path,
      'rpc.service': 'holiday-aggregator',
      'user.id': ctx.session?.user?.id || 'anonymous',
    },
  });

  try {
    const result = await context.with(
      trace.setSpan(context.active(), span),
      () => next({ ctx })
    );
    
    span.setStatus({ code: SpanStatusCode.OK });
    return result;
  } catch (error) {
    span.recordException(error as Error);
    span.setStatus({ code: SpanStatusCode.ERROR });
    throw error;
  } finally {
    span.end();
  }
});
```

#### Prisma Instrumentation
```typescript
// server/db.ts
import { PrismaInstrumentation } from '@opentelemetry/instrumentation-prisma';

new PrismaInstrumentation({
  middleware: true,
});

// Add tracing middleware to Prisma
prisma.$use(async (params, next) => {
  const span = trace.getActiveSpan();
  
  if (span) {
    span.setAttributes({
      'db.operation': params.action,
      'db.model': params.model,
    });
  }
  
  const result = await next(params);
  return result;
});
```

#### Custom Business Logic Spans
```typescript
// Example: Search operation tracing
export const searchPrograms = async (params: SearchParams) => {
  const span = tracer.startSpan('searchPrograms', {
    attributes: {
      'search.location': params.location,
      'search.radius': params.radius,
      'search.ageGroup': params.ageGroup,
    },
  });

  try {
    // Geocoding span
    const geoSpan = tracer.startSpan('geocodeLocation', { parent: span });
    const coordinates = await geocodeLocation(params.location);
    geoSpan.end();

    // Database query span
    const dbSpan = tracer.startSpan('queryPrograms', { parent: span });
    const programs = await db.program.findMany({
      // Query logic
    });
    dbSpan.setAttributes({ 'db.count': programs.length });
    dbSpan.end();

    return programs;
  } finally {
    span.end();
  }
};
```

### Sampling Configuration
```typescript
// Sampling rules
export const samplingRules = {
  // Sample all errors
  error: 1.0,
  // Sample 10% of normal traffic
  default: 0.1,
  // Sample 100% of slow requests (>1s)
  slow: 1.0,
  // Sample 100% of specific critical paths
  critical: {
    '/api/auth/login': 1.0,
    '/api/payment/process': 1.0,
    '/api/search': 0.5,
  },
};
```

### Testing Checklist
- [ ] Verify traces are being generated for all API calls
- [ ] Check trace context propagates through async operations
- [ ] Verify database queries appear in traces
- [ ] Confirm external API calls are traced
- [ ] Test trace sampling is working correctly
- [ ] Verify no sensitive data in trace attributes
- [ ] Check performance overhead is <5%
- [ ] Confirm traces appear in observability platform

### Definition of Done
- [ ] OpenTelemetry SDK integrated and configured
- [ ] All tRPC procedures automatically traced
- [ ] Database operations included in traces
- [ ] External API calls instrumented
- [ ] Sampling rules implemented
- [ ] Custom spans added for key operations
- [ ] Performance dashboards created
- [ ] Documentation updated with tracing guide
- [ ] Code reviewed and approved
- [ ] Deployed to production
