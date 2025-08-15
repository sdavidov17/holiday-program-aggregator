# Epic 4: Security, SRE & Observability
## Story 4.2: Structured Logging with Correlation IDs

**Dependencies:** 
- Epic 1, Story 1.1 (Initial Project Setup) - COMPLETED ✅

**Can be implemented:** NOW ✅

*As a developer, I want all logs to include correlation IDs and structured data, so that I can trace requests across the entire system.*

### Acceptance Criteria
1. All API requests generate unique correlation IDs
2. Correlation IDs propagate through all system components
3. Logs use structured JSON format with consistent schema
4. Logs include: timestamp, level, correlationId, userId, sessionId, journey, message
5. No PII appears in any log messages
6. Log aggregation service ingests and indexes all logs

### Development Tasks
- [x] Create correlation ID generation middleware
- [x] Implement request context propagation using AsyncLocalStorage
- [x] Create structured logger utility with standardized format
- [x] Implement PII scrubbing utility for log sanitization
- [x] Add correlation ID to tRPC context
- [x] Configure logger in all API endpoints and critical paths
- [ ] Set up log shipping to aggregation service (CloudWatch/Datadog)
- [ ] Create log parsing rules for structured data
- [ ] Implement log retention policies
- [ ] Create debugging utilities for correlation ID lookup

### Technical Details

#### Correlation ID Middleware
```typescript
// middleware/correlation.ts
import { nanoid } from 'nanoid';
import { NextRequest, NextResponse } from 'next/server';

export function correlationMiddleware(request: NextRequest) {
  const correlationId = request.headers.get('x-correlation-id') || nanoid();
  const response = NextResponse.next();
  response.headers.set('x-correlation-id', correlationId);
  return response;
}
```

#### Structured Logger Implementation
```typescript
// utils/logger.ts
interface LogContext {
  correlationId: string;
  userId?: string;
  sessionId?: string;
  journey?: string;
  traceId?: string;
  spanId?: string;
}

interface LogEntry {
  timestamp: string;
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  context: LogContext;
  data?: Record<string, any>;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

class StructuredLogger {
  private scrubPII(data: any): any {
    // Implementation to remove PII like emails, names, etc.
  }

  log(level: LogEntry['level'], message: string, context: LogContext, data?: any) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      data: this.scrubPII(data)
    };
    
    console.log(JSON.stringify(entry));
  }
}
```

#### Request Context Storage
```typescript
// utils/requestContext.ts
import { AsyncLocalStorage } from 'node:async_hooks';

interface RequestContext {
  correlationId: string;
  userId?: string;
  sessionId?: string;
  journey?: string;
}

export const requestContext = new AsyncLocalStorage<RequestContext>();
```

### PII Scrubbing Rules
- Email addresses → [REDACTED_EMAIL]
- Phone numbers → [REDACTED_PHONE]
- Credit card numbers → [REDACTED_CC]
- Names in known fields → [REDACTED_NAME]
- Addresses → [REDACTED_ADDRESS]
- Children's information → [REDACTED_CHILD_INFO]

### Log Schema Definition
```json
{
  "timestamp": "2024-01-20T10:30:00.000Z",
  "level": "info",
  "message": "User search performed",
  "context": {
    "correlationId": "abc123def456",
    "userId": "user_123",
    "sessionId": "session_456",
    "journey": "search_programs",
    "traceId": "trace_789",
    "spanId": "span_012"
  },
  "data": {
    "searchParams": {
      "location": "2000",
      "radius": 10,
      "ageGroup": "5-7"
    },
    "resultsCount": 15,
    "responseTime": 234
  }
}
```

### Testing Checklist
- [x] Verify correlation IDs are generated for all requests
- [x] Verify correlation IDs propagate to all log entries
- [x] Test PII scrubbing removes sensitive data
- [x] Verify logs are properly structured JSON
- [ ] Test log aggregation service receives logs
- [x] Verify correlation ID can trace full request path
- [ ] Test performance impact is minimal (<5ms)
- [ ] Verify no memory leaks from AsyncLocalStorage

### Definition of Done
- [x] Correlation ID middleware implemented
- [x] Structured logger created with PII scrubbing
- [x] Request context propagation working
- [x] All API endpoints use structured logging (tRPC procedures)
- [ ] Logs shipping to aggregation service
- [ ] Log retention policies configured
- [x] Documentation updated with logging standards
- [x] Code reviewed and approved
- [ ] Deployed to production
