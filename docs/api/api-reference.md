# API Reference

## Overview

The Holiday Program Aggregator API is built with tRPC v11, providing type-safe API endpoints with automatic TypeScript integration.

## Base URL

```
Development: http://localhost:3000/api/trpc
Staging: https://staging.holidayprograms.com.au/api/trpc
Production: https://api.holidayprograms.com.au/api/trpc
```

## Authentication

All authenticated endpoints require a valid session. Authentication is handled via NextAuth v4.

### Authentication Levels

| Level | Description | Usage |
|-------|-------------|-------|
| `publicProcedure` | No auth required | Health checks |
| `protectedProcedure` | Valid session required | User operations |
| `adminProcedure` | ADMIN role required | Admin operations |
| `premiumProcedure` | Active subscription required | Premium features |

```typescript
// Client-side authentication check
const { data: session } = useSession();
if (!session) {
  // Redirect to login
}

// Server-side authentication in tRPC
export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.session || !ctx.session.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }
  return next({ ctx: { session: ctx.session } });
});
```

---

## API Routers

### Router Overview

| Router | Procedures | Auth Level | Description |
|--------|------------|------------|-------------|
| `healthz` | 1 | Public | Health checks |
| `user` | 2 | Protected | User profile management |
| `provider` | 9 | Admin/Protected | Provider and program CRUD |
| `subscription` | 5 | Protected | Stripe subscription lifecycle |
| `admin` | 4 | Admin | User administration |

---

## Healthz Router

Health check endpoints for monitoring and load balancer probes.

### `healthz.healthz`

Get API health status.

**Type**: Query
**Auth**: Public
**Input**: None

**Response**:
```typescript
{
  status: "ok";
  timestamp: string; // ISO 8601 datetime
}
```

**Example**:
```typescript
const health = api.healthz.healthz.useQuery();
// { status: "ok", timestamp: "2025-01-15T10:30:00.000Z" }
```

---

## User Router

User profile management endpoints.

### `user.me`

Get current authenticated user's session data.

**Type**: Query
**Auth**: Protected
**Input**: None

**Response**:
```typescript
{
  id: string;
  email: string;
  name: string | null;
  role: "USER" | "ADMIN";
}
```

**Example**:
```typescript
const { data: user } = api.user.me.useQuery();
```

---

### `user.updateProfile`

Update current user's profile.

**Type**: Mutation
**Auth**: Protected

**Input**:
```typescript
{
  name?: string;  // Optional new name
}
```

**Response**:
```typescript
{
  id: string;
  name: string | null;
  email: string;
}
```

**Example**:
```typescript
const updateProfile = api.user.updateProfile.useMutation();
await updateProfile.mutateAsync({ name: "New Name" });
```

---

## Provider Router

Provider and program management endpoints. Most operations require ADMIN role.

### `provider.getAll`

Get all providers with optional filtering.

**Type**: Query
**Auth**: Admin

**Input**:
```typescript
{
  includeUnpublished?: boolean;  // Default: false
  includeUnvetted?: boolean;     // Default: false
}
```

**Response**:
```typescript
Array<{
  id: string;
  businessName: string;
  contactName: string;
  email: string;
  phone: string;
  website: string | null;
  abn: string | null;
  address: string;
  suburb: string;
  state: string;
  postcode: string;
  description: string;
  logoUrl: string | null;
  bannerUrl: string | null;
  capacity: number | null;
  ageGroups: string;           // JSON array as string
  specialNeeds: boolean;
  specialNeedsDetails: string | null;
  isPublished: boolean;
  isVetted: boolean;
  vettingStatus: "NOT_STARTED" | "IN_PROGRESS" | "APPROVED" | "REJECTED";
  vettingNotes: string | null;
  vettingDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
  programs: Program[];
}>
```

---

### `provider.getPublished`

Get all published and vetted providers with active programs.

**Type**: Query
**Auth**: Protected

**Input**: None

**Response**: Array of providers with published, active programs.

---

### `provider.getById`

Get single provider by ID.

**Type**: Query
**Auth**: Protected

**Input**:
```typescript
{
  id: string;  // Provider ID (cuid)
}
```

**Response**: Full provider object with programs.

**Errors**:
- `NOT_FOUND`: Provider doesn't exist
- `FORBIDDEN`: Provider is unpublished and user is not ADMIN

---

### `provider.create`

Create a new provider.

**Type**: Mutation
**Auth**: Admin

**Input**:
```typescript
{
  businessName: string;          // Required, min 1 char
  contactName: string;           // Required
  email: string;                 // Valid email
  phone: string;                 // Required
  website?: string;              // Valid URL or empty
  abn?: string;
  address: string;               // Required
  suburb: string;                // Required
  state: string;                 // Required
  postcode: string;              // Required
  description: string;           // Required
  logoUrl?: string;              // Valid URL or empty
  bannerUrl?: string;            // Valid URL or empty
  capacity?: number;
  ageGroups?: string[];          // e.g., ["5-7", "8-12"]
  specialNeeds?: boolean;
  specialNeedsDetails?: string;
  isVetted?: boolean;
  isPublished?: boolean;
}
```

**Response**: Created provider object.

---

### `provider.update`

Update an existing provider.

**Type**: Mutation
**Auth**: Admin

**Input**: Partial provider object with required `id` field.

**Response**: Updated provider object.

**Errors**:
- `NOT_FOUND`: Provider doesn't exist

---

### `provider.delete`

Delete a provider and all associated programs.

**Type**: Mutation
**Auth**: Admin

**Input**:
```typescript
{
  id: string;
}
```

**Response**:
```typescript
{
  success: true;
}
```

---

### `provider.toggleVetting`

Toggle provider vetting status.

**Type**: Mutation
**Auth**: Admin

**Input**:
```typescript
{
  id: string;
}
```

**Response**: Updated provider object with toggled `isVetted`.

---

### `provider.togglePublishing`

Toggle provider publishing status.

**Type**: Mutation
**Auth**: Admin

**Input**:
```typescript
{
  id: string;
}
```

**Response**: Updated provider object.

**Errors**:
- `NOT_FOUND`: Provider doesn't exist
- `BAD_REQUEST`: Provider must be vetted before publishing

---

### `provider.createProgram`

Create a program for a provider.

**Type**: Mutation
**Auth**: Admin

**Input**:
```typescript
{
  providerId: string;            // Required
  name: string;                  // Required
  description: string;           // Required
  category: string;              // e.g., "Sports", "Arts"
  ageMin: number;                // Minimum age (int >= 0)
  ageMax: number;                // Maximum age (int >= 0)
  price: number;                 // Price >= 0
  location: string;              // Required
  startDate: Date;               // Program start date
  endDate: Date;                 // Program end date
  startTime: string;             // "HH:MM" format
  endTime: string;               // "HH:MM" format
  daysOfWeek?: string[];         // e.g., ["Monday", "Wednesday"]
  capacity?: number;
  enrollmentUrl?: string;        // Valid URL
  imageUrl?: string;             // Valid URL
  isActive?: boolean;
  isPublished?: boolean;
}
```

**Response**: Created program object.

---

## Subscription Router

Stripe subscription lifecycle management.

### `subscription.getSubscriptionStatus`

Get detailed subscription status for current user.

**Type**: Query
**Auth**: Protected

**Input**: None

**Response**:
```typescript
{
  hasSubscription: boolean;
  isActive: boolean;
  status: "PENDING" | "ACTIVE" | "PAST_DUE" | "CANCELED" | "EXPIRED" | null;
  expiresAt: Date | null;
  cancelAtPeriodEnd: boolean;
}
```

---

### `subscription.getStatus`

Get subscription details for current user.

**Type**: Query
**Auth**: Protected

**Input**: None

**Response**:
```typescript
{
  status: string;
  expiresAt: Date | null;
  currentPeriodEnd: Date | null;
  cancelAtPeriodEnd: boolean;
  stripeSubscriptionId: string | null;
} | null  // null if no subscription
```

---

### `subscription.createCheckoutSession`

Create a Stripe checkout session for subscription.

**Type**: Mutation
**Auth**: Protected

**Input**:
```typescript
{
  priceId?: string;  // Optional Stripe price ID
}
```

**Response**:
```typescript
{
  sessionId: string;
  url: string;  // Stripe checkout URL - redirect user here
}
```

**Example**:
```typescript
const createCheckout = api.subscription.createCheckoutSession.useMutation();
const { url } = await createCheckout.mutateAsync({});
window.location.href = url;  // Redirect to Stripe
```

---

### `subscription.cancelSubscription`

Cancel subscription at end of current billing period.

**Type**: Mutation
**Auth**: Protected

**Input**: None

**Response**:
```typescript
{
  success: boolean;
  message: string;
}
```

---

### `subscription.resumeSubscription`

Resume a cancelled subscription before it expires.

**Type**: Mutation
**Auth**: Protected

**Input**: None

**Response**:
```typescript
{
  success: boolean;
  message: string;
}
```

---

## Admin Router

User administration endpoints. All require ADMIN role.

### `admin.getUsers`

Get all users in the system.

**Type**: Query
**Auth**: Admin

**Input**: None

**Response**:
```typescript
Array<{
  id: string;
  email: string;
  name: string | null;
  role: "USER" | "ADMIN";
  createdAt: Date;
  emailVerified: Date | null;
}>
```

---

### `admin.updateUserRole`

Update a user's role.

**Type**: Mutation
**Auth**: Admin

**Input**:
```typescript
{
  userId: string;
  role: "USER" | "ADMIN";
}
```

**Response**: Updated user object.

**Errors**:
- `BAD_REQUEST`: Cannot remove the last admin

---

### `admin.deleteUser`

Delete a user from the system.

**Type**: Mutation
**Auth**: Admin

**Input**:
```typescript
{
  userId: string;
}
```

**Response**:
```typescript
{
  success: true;
}
```

**Errors**:
- `BAD_REQUEST`: Cannot delete your own account
- `BAD_REQUEST`: Cannot delete the last admin

---

### `admin.getUserStats`

Get user statistics for dashboard.

**Type**: Query
**Auth**: Admin

**Input**: None

**Response**:
```typescript
{
  totalUsers: number;
  adminUsers: number;
  verifiedUsers: number;      // Users with verified email
  recentUsers: number;        // Users created in last 30 days
}
```

---

## Error Handling

All errors follow the tRPC error format:

```typescript
{
  message: string;
  code: TRPCErrorCode;
  cause?: unknown;
}
```

### Error Codes

| Code | Description | HTTP Status |
|------|-------------|-------------|
| `BAD_REQUEST` | Invalid input or business rule violation | 400 |
| `UNAUTHORIZED` | Not authenticated | 401 |
| `FORBIDDEN` | Not authorized for this action | 403 |
| `NOT_FOUND` | Resource not found | 404 |
| `TIMEOUT` | Request timeout | 408 |
| `CONFLICT` | Resource conflict | 409 |
| `TOO_MANY_REQUESTS` | Rate limited | 429 |
| `INTERNAL_SERVER_ERROR` | Server error | 500 |

### Zod Validation Errors

When input validation fails, errors include field-level details:

```typescript
{
  code: "BAD_REQUEST",
  message: "Validation failed",
  cause: {
    fieldErrors: {
      email: ["Invalid email format"],
      phone: ["Phone is required"]
    }
  }
}
```

---

## Webhooks

### Stripe Webhooks

**Endpoint**: `POST /api/stripe/webhook`

**Events Handled**:
- `checkout.session.completed` - Activate subscription
- `customer.subscription.updated` - Status changes
- `customer.subscription.deleted` - Cancellation
- `invoice.payment_failed` - Payment issues

**Security**: Signature verification required
```typescript
const sig = req.headers['stripe-signature'];
const event = stripe.webhooks.constructEvent(
  req.body,
  sig,
  process.env.STRIPE_WEBHOOK_SECRET
);
```

---

## Client Usage

### React Query Integration

```typescript
import { api } from '~/utils/api';

function ProviderList() {
  // Query
  const { data, isLoading, error } = api.provider.getPublished.useQuery();

  // Mutation with optimistic update
  const utils = api.useUtils();
  const deleteProvider = api.provider.delete.useMutation({
    onSuccess: () => {
      utils.provider.getAll.invalidate();
    },
  });

  if (isLoading) return <Loading />;
  if (error) return <Error message={error.message} />;

  return <ProviderGrid providers={data} />;
}
```

### Server-Side Calls

```typescript
import { appRouter } from "~/server/api/root";
import { createInnerTRPCContext } from "~/server/api/trpc";

const ctx = createInnerTRPCContext({
  session: await getServerAuthSession(),
});

const caller = appRouter.createCaller(ctx);
const providers = await caller.provider.getPublished();
```

---

## Audit Logging

All mutations are automatically logged to the `AuditLog` table:

| Field | Description |
|-------|-------------|
| `eventType` | CREATE, UPDATE, DELETE |
| `userId` | User who performed action |
| `correlationId` | Request trace ID |
| `metadata` | Before/after state (JSON) |
| `result` | "success" or "failure" |
| `timestamp` | When action occurred |

---

## Related Documentation

- [Architecture Overview](../architecture/high-level-architecture.md)
- [Data Models](../architecture/data-models.md)
- [Testing Strategy](../guides/testing-strategy.md)
