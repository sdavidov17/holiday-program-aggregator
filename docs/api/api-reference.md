# API Reference

## Overview

The Holiday Program Aggregator API is built with tRPC v11, providing type-safe API endpoints with automatic TypeScript integration.

## Base URL

```
Development: http://localhost:3000/api/trpc
Staging: https://staging-holidayprograms.com.au/api/trpc
Production: https://api.holidayprograms.com.au/api/trpc
```

## Authentication

All authenticated endpoints require a valid session. Authentication is handled via NextAuth v5.

```typescript
// Client-side authentication check
const { data: session } = useSession();
if (!session) {
  // Redirect to login
}

// Server-side authentication
const session = await getServerAuthSession(ctx);
if (!session) {
  throw new TRPCError({ code: 'UNAUTHORIZED' });
}
```

## API Endpoints

### Auth Router

#### `auth.getSession`
Get current user session.

**Type**: Query  
**Auth**: Optional  
**Input**: None  

**Response**:
```typescript
{
  user: {
    id: string;
    email: string;
    name: string;
    role: 'USER' | 'ADMIN' | 'PROVIDER';
  } | null;
}
```

#### `auth.getSecretMessage`
Example protected endpoint.

**Type**: Query  
**Auth**: Required  
**Input**: None  

**Response**:
```typescript
string // "You can now see this secret message!"
```

### Provider Router

#### `provider.search`
Search for providers by location and filters.

**Type**: Query  
**Auth**: Optional  
**Rate Limit**: 100 req/min  

**Input**:
```typescript
{
  location: {
    lat: number;    // -90 to 90
    lng: number;    // -180 to 180
  };
  radius: number;   // In kilometers, max 50
  filters?: {
    ageGroups?: ('TODDLER' | 'PRESCHOOL' | 'PRIMARY' | 'HIGH_SCHOOL')[];
    activities?: string[];
    priceRange?: {
      min?: number; // Minimum price per day
      max?: number; // Maximum price per day
    };
    hasVacancies?: boolean;
    verified?: boolean;
  };
  pagination?: {
    limit?: number;  // Default 20, max 100
    offset?: number; // Default 0
  };
}
```

**Response**:
```typescript
{
  providers: Array<{
    id: string;
    name: string;
    description: string;
    location: {
      lat: number;
      lng: number;
      address: string;
    };
    distance: number; // In kilometers
    priceRange: {
      min: number;
      max: number;
    };
    ageGroups: string[];
    activities: string[];
    rating: number | null;
    reviewCount: number;
    images: string[];
    verified: boolean;
    hasVacancies: boolean;
  }>;
  total: number;
  hasMore: boolean;
}
```

#### `provider.getById`
Get detailed provider information.

**Type**: Query  
**Auth**: Optional  
**Cache**: 5 minutes  

**Input**:
```typescript
{
  id: string; // Provider ID
}
```

**Response**:
```typescript
{
  id: string;
  name: string;
  description: string;
  location: {
    lat: number;
    lng: number;
    address: string;
    suburb: string;
    state: string;
    postcode: string;
  };
  contact: {
    phone: string;
    email: string;
    website?: string;
  };
  hours: {
    monday: { open: string; close: string; } | null;
    tuesday: { open: string; close: string; } | null;
    // ... other days
  };
  programs: Array<{
    id: string;
    name: string;
    description: string;
    ageGroup: string;
    price: number;
    duration: string;
    schedule: string;
    capacity: number;
    enrolled: number;
  }>;
  facilities: string[];
  certifications: string[];
  images: Array<{
    url: string;
    caption?: string;
  }>;
  reviews: {
    average: number;
    count: number;
    recent: Array<{
      id: string;
      rating: number;
      comment: string;
      author: string;
      date: string;
    }>;
  };
}
```

#### `provider.create`
Create a new provider (Admin only).

**Type**: Mutation  
**Auth**: Required (ADMIN)  
**Validation**: Strict  

**Input**:
```typescript
{
  name: string;          // 2-100 chars
  description: string;   // 10-1000 chars
  location: {
    address: string;
    suburb: string;
    state: string;
    postcode: string;
  };
  contact: {
    phone: string;     // Valid AU phone
    email: string;     // Valid email
    website?: string;  // Valid URL
  };
  // ... other fields
}
```

#### `provider.update`
Update provider information.

**Type**: Mutation  
**Auth**: Required (ADMIN or PROVIDER owner)  

**Input**: Partial provider object with `id`

#### `provider.addReview`
Add a review for a provider.

**Type**: Mutation  
**Auth**: Required  
**Rate Limit**: 1 review per provider per user  

**Input**:
```typescript
{
  providerId: string;
  rating: number;      // 1-5
  comment?: string;    // Max 500 chars
}
```

### Subscription Router

#### `subscription.getCurrentPlan`
Get user's current subscription.

**Type**: Query  
**Auth**: Required  

**Response**:
```typescript
{
  plan: 'FREE' | 'PREMIUM' | 'FAMILY';
  status: 'ACTIVE' | 'CANCELLED' | 'EXPIRED';
  expiresAt: string | null;
  features: {
    searches: number | 'UNLIMITED';
    savedProviders: number;
    alerts: boolean;
    prioritySupport: boolean;
  };
}
```

#### `subscription.createCheckoutSession`
Create Stripe checkout session.

**Type**: Mutation  
**Auth**: Required  

**Input**:
```typescript
{
  plan: 'PREMIUM' | 'FAMILY';
  interval: 'MONTHLY' | 'YEARLY';
}
```

**Response**:
```typescript
{
  sessionId: string;
  url: string; // Stripe checkout URL
}
```

#### `subscription.cancel`
Cancel active subscription.

**Type**: Mutation  
**Auth**: Required  

**Response**:
```typescript
{
  success: boolean;
  message: string;
}
```

### User Router

#### `user.getProfile`
Get user profile information.

**Type**: Query  
**Auth**: Required  

**Response**:
```typescript
{
  id: string;
  email: string;
  name: string;
  preferences: {
    location?: {
      lat: number;
      lng: number;
      radius: number;
    };
    ageGroups?: string[];
    activities?: string[];
    budget?: {
      min: number;
      max: number;
    };
    notifications: {
      email: boolean;
      newProviders: boolean;
      priceDrops: boolean;
      programUpdates: boolean;
    };
  };
  savedProviders: string[];
  createdAt: string;
}
```

#### `user.updatePreferences`
Update user preferences.

**Type**: Mutation  
**Auth**: Required  

**Input**: Partial preferences object

#### `user.saveProvider`
Save a provider to favorites.

**Type**: Mutation  
**Auth**: Required  

**Input**:
```typescript
{
  providerId: string;
}
```

#### `user.unsaveProvider`
Remove provider from favorites.

**Type**: Mutation  
**Auth**: Required  

**Input**:
```typescript
{
  providerId: string;
}
```

### Admin Router

#### `admin.getStats`
Get platform statistics.

**Type**: Query  
**Auth**: Required (ADMIN)  

**Response**:
```typescript
{
  users: {
    total: number;
    active: number;
    new: number; // Last 30 days
  };
  providers: {
    total: number;
    verified: number;
    pending: number;
  };
  subscriptions: {
    free: number;
    premium: number;
    family: number;
    revenue: number; // Monthly
  };
  usage: {
    searches: number; // Daily average
    signups: number;  // Daily average
  };
}
```

#### `admin.verifyProvider`
Verify a provider.

**Type**: Mutation  
**Auth**: Required (ADMIN)  

**Input**:
```typescript
{
  providerId: string;
  verified: boolean;
  notes?: string;
}
```

## Error Handling

All errors follow the tRPC error format:

```typescript
{
  message: string;
  code: 'BAD_REQUEST' | 'UNAUTHORIZED' | 'FORBIDDEN' | 'NOT_FOUND' | 'INTERNAL_SERVER_ERROR';
  cause?: unknown;
}
```

### Common Error Codes

| Code | Description | HTTP Status |
|------|-------------|-------------|
| `BAD_REQUEST` | Invalid input | 400 |
| `UNAUTHORIZED` | Not authenticated | 401 |
| `FORBIDDEN` | Not authorized | 403 |
| `NOT_FOUND` | Resource not found | 404 |
| `TIMEOUT` | Request timeout | 408 |
| `CONFLICT` | Resource conflict | 409 |
| `TOO_MANY_REQUESTS` | Rate limited | 429 |
| `INTERNAL_SERVER_ERROR` | Server error | 500 |

## Rate Limiting

Default rate limits:
- Anonymous: 60 requests/minute
- Authenticated: 120 requests/minute
- Premium: 300 requests/minute

Headers returned:
```
X-RateLimit-Limit: 120
X-RateLimit-Remaining: 119
X-RateLimit-Reset: 1640995200
```

## Pagination

Standard pagination parameters:

```typescript
{
  limit: number;  // Items per page (default: 20, max: 100)
  offset: number; // Skip items (default: 0)
  cursor?: string; // For cursor-based pagination
}
```

Response includes:
```typescript
{
  data: T[];
  total: number;
  hasMore: boolean;
  nextCursor?: string;
}
```

## Webhooks

### Stripe Webhooks

**Endpoint**: `/api/webhooks/stripe`

Events handled:
- `checkout.session.completed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_failed`

**Security**: Verify webhook signature
```typescript
const sig = req.headers['stripe-signature'];
const event = stripe.webhooks.constructEvent(
  req.body,
  sig,
  process.env.STRIPE_WEBHOOK_SECRET
);
```

## Client Usage

### TypeScript Client

```typescript
import { api } from '~/utils/api';

// In React component
function ProviderSearch() {
  const { data, isLoading, error } = api.provider.search.useQuery({
    location: { lat: -33.8688, lng: 151.2093 },
    radius: 10,
    filters: {
      verified: true,
      ageGroups: ['PRIMARY'],
    },
  });

  if (isLoading) return <Loading />;
  if (error) return <Error message={error.message} />;
  
  return <ProviderList providers={data.providers} />;
}

// Mutations
const createReview = api.provider.addReview.useMutation({
  onSuccess: () => {
    // Invalidate and refetch
    utils.provider.getById.invalidate();
  },
});

// Call mutation
await createReview.mutateAsync({
  providerId: '123',
  rating: 5,
  comment: 'Excellent program!',
});
```

### Raw HTTP

```bash
# Search providers
curl -X POST https://api.holidayprograms.com.au/api/trpc/provider.search \
  -H "Content-Type: application/json" \
  -d '{
    "json": {
      "location": {"lat": -33.8688, "lng": 151.2093},
      "radius": 10
    }
  }'

# With authentication
curl -X POST https://api.holidayprograms.com.au/api/trpc/user.getProfile \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=..." \
  -d '{"json": {}}'
```

## Development Tools

### tRPC Panel

Access at: `http://localhost:3000/api/panel`

Features:
- Browse all procedures
- Test queries and mutations
- View input/output schemas
- Generate TypeScript types

### Testing

```typescript
// Test utilities
import { createInnerTRPCContext } from "~/server/api/trpc";
import { appRouter } from "~/server/api/root";

const ctx = createInnerTRPCContext({
  session: {
    user: { id: "test", email: "test@example.com" },
  },
});

const caller = appRouter.createCaller(ctx);

// Test query
const result = await caller.provider.search({
  location: { lat: -33.8688, lng: 151.2093 },
  radius: 10,
});
```

## Performance

### Caching Strategy

- Static data: 24 hours
- Provider details: 5 minutes
- Search results: 1 minute
- User data: No cache

### Query Optimization

- Use field selection to reduce payload
- Implement cursor pagination for large lists
- Batch similar queries
- Use React Query caching

## Versioning

API versioning through tRPC router namespacing:

```typescript
// Future version
export const appRouter = createTRPCRouter({
  v1: v1Router,
  v2: v2Router, // New version
});
```

## Related Documentation

- [Architecture Overview](./Specs/architecture/high-level-architecture.md)
- [Data Models](./Specs/architecture/data-models.md)
- [Authentication Guide](./Specs/architecture/authentication-authorization.md)
- [Testing Strategy](./testing-strategy.md)