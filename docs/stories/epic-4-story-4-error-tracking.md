# Epic 4: Security, SRE & Observability
## Story 4.4: Error Tracking with Sentry

**Dependencies:** 
- Epic 1, Story 1.1 (Initial Project Setup) - COMPLETED ✅
- Epic 4, Story 4.2 (Structured Logging) - For correlation ID integration

**Can be implemented:** NOW (basic), enhanced after Story 4.2

*As a developer, I want automatic error tracking with full context, so that I can quickly identify and fix production issues.*

### Acceptance Criteria
1. Sentry integrated in both frontend and backend
2. Errors include user context (ID, session, journey)
3. Source maps uploaded for meaningful stack traces
4. PII automatically scrubbed from error reports
5. Errors grouped intelligently by root cause
6. Slack notifications for new error types

### Development Tasks
- [ ] Install Sentry Next.js SDK
- [ ] Configure Sentry for client and server
- [ ] Set up source map upload in build process
- [ ] Implement PII scrubbing rules
- [ ] Add user context to error reports
- [ ] Configure error grouping rules
- [ ] Set up Slack integration for alerts
- [ ] Create error boundary components
- [ ] Add manual error reporting utilities
- [ ] Configure performance monitoring

### Technical Details

#### Sentry Client Configuration
```typescript
// sentry.client.config.ts
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  beforeSend(event, hint) {
    // Scrub PII from error events
    if (event.request?.cookies) {
      delete event.request.cookies;
    }
    
    // Remove sensitive data from breadcrumbs
    event.breadcrumbs = event.breadcrumbs?.map(breadcrumb => {
      if (breadcrumb.data) {
        breadcrumb.data = scrubSensitiveData(breadcrumb.data);
      }
      return breadcrumb;
    });
    
    return event;
  },
  
  integrations: [
    new Sentry.BrowserTracing({
      routingInstrumentation: Sentry.nextRouterInstrumentation,
    }),
    new Sentry.Replay({
      maskAllText: true,
      maskAllInputs: true,
    }),
  ],
});
```

#### Sentry Server Configuration
```typescript
// sentry.server.config.ts
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  beforeSend(event) {
    // Add correlation ID if available
    const correlationId = getCorrelationId();
    if (correlationId) {
      event.tags = {
        ...event.tags,
        correlationId,
      };
    }
    
    // Scrub PII
    return scrubPIIFromEvent(event);
  },
});
```

#### Error Context Enhancement
```typescript
// utils/sentry.ts
export function setSentryUser(user: User | null) {
  if (user) {
    Sentry.setUser({
      id: user.id,
      email: '[REDACTED]', // Don't send PII
      subscription_status: user.subscriptionStatus,
    });
  } else {
    Sentry.setUser(null);
  }
}

export function addSentryContext(context: {
  journey?: string;
  searchParams?: any;
  correlationId?: string;
}) {
  Sentry.setContext('journey', {
    name: context.journey,
    correlationId: context.correlationId,
  });
  
  if (context.searchParams) {
    Sentry.setContext('search', {
      location: context.searchParams.location,
      radius: context.searchParams.radius,
    });
  }
}
```

#### Error Boundary Implementation
```typescript
// components/ErrorBoundary.tsx
import * as Sentry from '@sentry/nextjs';

class ErrorBoundary extends React.Component<Props, State> {
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    Sentry.withScope((scope) => {
      scope.setExtras(errorInfo);
      scope.setTag('component', 'ErrorBoundary');
      scope.setLevel('error');
      Sentry.captureException(error);
    });
  }
  
  render() {
    if (this.state.hasError) {
      return <ErrorFallback />;
    }
    return this.props.children;
  }
}
```

### PII Scrubbing Rules
- Email addresses
- Phone numbers
- Credit card numbers
- Full names
- Addresses
- IP addresses (except for security events)
- Session tokens
- API keys

### Alert Configuration
- New error types: Immediate Slack notification
- Error rate spike (>5x baseline): Page on-call
- Specific errors (payment, auth): High priority
- Performance degradation: Warning

### Testing Checklist
- [ ] Verify errors are captured in development
- [ ] Test source maps show correct file/line
- [ ] Verify PII is scrubbed from events
- [ ] Test error grouping works correctly
- [ ] Verify user context is attached
- [ ] Test Slack notifications trigger
- [ ] Verify performance impact is minimal
- [ ] Test error boundary catches React errors

### Definition of Done
- [ ] Sentry SDK integrated in frontend and backend
- [ ] Source map upload automated in CI/CD
- [ ] PII scrubbing rules implemented
- [ ] User context automatically attached
- [ ] Error boundaries protecting key components
- [ ] Slack alerts configured
- [ ] Performance monitoring enabled
- [ ] Documentation updated
- [ ] Code reviewed and approved
- [ ] Deployed to production