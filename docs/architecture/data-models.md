# Data Models

This document describes the database schema, entity relationships, and TypeScript interfaces for the Holiday Program Aggregator.

## Entity Relationship Diagram

```
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│      User       │       │     Account     │       │     Session     │
├─────────────────┤       ├─────────────────┤       ├─────────────────┤
│ id (PK)         │──┐    │ id (PK)         │       │ id (PK)         │
│ email (unique)  │  │    │ userId (FK)     │───────│ userId (FK)     │
│ emailVerified   │  │    │ provider        │       │ sessionToken    │
│ name            │  │    │ providerAcctId  │       │ expires         │
│ password        │  │    │ access_token    │       └─────────────────┘
│ role            │  │    │ refresh_token   │
│ image           │  │    └─────────────────┘
│ createdAt       │  │
│ updatedAt       │  │    ┌─────────────────┐
└─────────────────┘  │    │  Subscription   │
         │           │    ├─────────────────┤
         │           └───▶│ id (PK)         │
         │                │ userId (FK,uniq)│
         │                │ status          │
         │                │ stripe*         │
         │                │ currentPeriod*  │
         │                │ expiresAt       │
         ▼                └─────────────────┘
┌─────────────────┐
│    AuditLog     │
├─────────────────┤       ┌─────────────────┐       ┌─────────────────┐
│ id (PK)         │       │    Provider     │       │    Program      │
│ userId (FK)     │       ├─────────────────┤       ├─────────────────┤
│ eventType       │       │ id (PK)         │──────▶│ id (PK)         │
│ timestamp       │       │ businessName    │       │ providerId (FK) │
│ metadata        │       │ contactName     │       │ name            │
│ result          │       │ email, phone    │       │ description     │
└─────────────────┘       │ address, suburb │       │ category        │
                          │ state, postcode │       │ ageMin, ageMax  │
                          │ description     │       │ price           │
                          │ isPublished     │       │ startDate       │
                          │ isVetted        │       │ endDate         │
                          │ vettingStatus   │       │ isPublished     │
                          └─────────────────┘       └─────────────────┘
```

---

## Core Models

### User

Represents authenticated users of the platform.

**Table**: `User`

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | String | PK, cuid() | Unique identifier |
| `email` | String | Unique, Required | User's email address |
| `emailVerified` | DateTime | Optional | When email was verified |
| `image` | String | Optional | Profile image URL |
| `name` | String | Optional | Display name |
| `password` | String | Optional | Bcrypt hash for credentials auth |
| `role` | String | Default: "USER" | "USER" or "ADMIN" |
| `createdAt` | DateTime | Auto | Creation timestamp |
| `updatedAt` | DateTime | Auto | Last update timestamp |

**Relations**:
- `accounts`: Account[] (1:N) - OAuth provider accounts
- `sessions`: Session[] (1:N) - Active sessions
- `subscriptions`: Subscription[] (1:N) - Subscription records
- `auditLogs`: AuditLog[] (1:N) - Actions performed by user

**TypeScript Interface**:
```typescript
interface User {
  id: string;
  email: string;
  emailVerified: Date | null;
  image: string | null;
  name: string | null;
  password: string | null;
  role: "USER" | "ADMIN";
  createdAt: Date;
  updatedAt: Date;
}
```

---

### Provider

Represents holiday program providers (businesses/organizations).

**Table**: `Provider`

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | String | PK, cuid() | Unique identifier |
| `businessName` | String | Required | Company/organization name |
| `contactName` | String | Required | Primary contact person |
| `email` | String | Required | Contact email |
| `phone` | String | Required | Contact phone |
| `website` | String | Optional | Provider website URL |
| `abn` | String | Optional | Australian Business Number |
| `address` | String | Required | Street address |
| `suburb` | String | Required | Suburb/locality |
| `state` | String | Required | State (NSW, VIC, etc.) |
| `postcode` | String | Required | Postal code |
| `description` | String | Required | Provider description |
| `logoUrl` | String | Optional | Logo image URL |
| `bannerUrl` | String | Optional | Banner image URL |
| `capacity` | Int | Optional | Maximum capacity |
| `ageGroups` | String | Default: "[]" | JSON array of age ranges |
| `specialNeeds` | Boolean | Default: false | Supports special needs |
| `specialNeedsDetails` | String | Optional | Special needs details |
| `isPublished` | Boolean | Default: false | Visible to parents |
| `isVetted` | Boolean | Default: false | Verified by admin |
| `vettingStatus` | String | Default: "NOT_STARTED" | Vetting workflow state |
| `vettingNotes` | String | Optional | Admin vetting notes |
| `vettingDate` | DateTime | Optional | When vetting occurred |
| `createdAt` | DateTime | Auto | Creation timestamp |
| `updatedAt` | DateTime | Auto | Last update timestamp |

**Vetting Status Values**:
- `NOT_STARTED` - Initial state
- `IN_PROGRESS` - Under review
- `APPROVED` - Verified and approved
- `REJECTED` - Failed verification

**Indexes**:
- `(suburb, state)` - Location-based queries
- `(isPublished, isVetted)` - Public listing queries

**Relations**:
- `programs`: Program[] (1:N) - Programs offered by provider

**TypeScript Interface**:
```typescript
interface Provider {
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
  ageGroups: string;  // JSON array: ["5-7", "8-12"]
  specialNeeds: boolean;
  specialNeedsDetails: string | null;
  isPublished: boolean;
  isVetted: boolean;
  vettingStatus: "NOT_STARTED" | "IN_PROGRESS" | "APPROVED" | "REJECTED";
  vettingNotes: string | null;
  vettingDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
  programs?: Program[];
}
```

---

### Program

Represents individual holiday programs offered by providers.

**Table**: `Program`

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | String | PK, cuid() | Unique identifier |
| `providerId` | String | FK, Required | Parent provider |
| `name` | String | Required | Program name |
| `description` | String | Required | Program description |
| `category` | String | Required | Activity type (Sports, Arts, etc.) |
| `ageMin` | Int | Required | Minimum age |
| `ageMax` | Int | Required | Maximum age |
| `price` | Float | Required | Price per session/day |
| `location` | String | Required | Program location |
| `startDate` | DateTime | Required | Program start date |
| `endDate` | DateTime | Required | Program end date |
| `startTime` | String | Required | Daily start time (HH:MM) |
| `endTime` | String | Required | Daily end time (HH:MM) |
| `daysOfWeek` | String | Default: "[]" | JSON array of days |
| `capacity` | Int | Optional | Maximum participants |
| `enrollmentUrl` | String | Optional | External booking link |
| `imageUrl` | String | Optional | Program image URL |
| `isActive` | Boolean | Default: true | Currently accepting enrollments |
| `isPublished` | Boolean | Default: false | Visible to parents |
| `programStatus` | String | Default: "DRAFT" | Lifecycle status |
| `createdAt` | DateTime | Auto | Creation timestamp |
| `updatedAt` | DateTime | Auto | Last update timestamp |

**Program Status Values**:
- `DRAFT` - Being created
- `PUBLISHED` - Live and visible
- `ARCHIVED` - Past program
- `CANCELLED` - Cancelled program

**Indexes**:
- `(startDate, endDate)` - Date range queries
- `(category, isActive, isPublished)` - Filtered search
- `(providerId)` - Provider's programs

**Relations**:
- `provider`: Provider (N:1) - Parent provider (cascade delete)

**TypeScript Interface**:
```typescript
interface Program {
  id: string;
  providerId: string;
  name: string;
  description: string;
  category: string;
  ageMin: number;
  ageMax: number;
  price: number;
  location: string;
  startDate: Date;
  endDate: Date;
  startTime: string;
  endTime: string;
  daysOfWeek: string;  // JSON array: ["Monday", "Wednesday", "Friday"]
  capacity: number | null;
  enrollmentUrl: string | null;
  imageUrl: string | null;
  isActive: boolean;
  isPublished: boolean;
  programStatus: "DRAFT" | "PUBLISHED" | "ARCHIVED" | "CANCELLED";
  createdAt: Date;
  updatedAt: Date;
  provider?: Provider;
}
```

---

### Subscription

Manages Stripe subscription lifecycle.

**Table**: `Subscription`

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | String | PK, cuid() | Unique identifier |
| `userId` | String | FK, Unique | Owning user (1:1) |
| `status` | String | Default: "PENDING" | Subscription state |
| `stripeCustomerId` | String | Optional | Stripe customer ID |
| `stripeSubscriptionId` | String | Optional, Unique | Stripe subscription ID |
| `stripePriceId` | String | Optional | Stripe price ID |
| `stripePaymentMethodId` | String | Optional | Payment method ID |
| `stripePaymentIntentId` | String | Optional | Payment intent ID |
| `stripePaymentStatus` | String | Optional | Payment status |
| `currentPeriodStart` | DateTime | Optional | Billing period start |
| `currentPeriodEnd` | DateTime | Optional | Billing period end |
| `canceledAt` | DateTime | Optional | When cancelled |
| `cancelAtPeriodEnd` | Boolean | Default: false | Cancel at renewal |
| `trialEndsAt` | DateTime | Optional | Trial end date |
| `expiresAt` | DateTime | Optional | Access expiration |
| `lastReminderSent` | DateTime | Optional | Last renewal reminder |
| `reminderCount` | Int | Default: 0 | Reminders sent |
| `createdAt` | DateTime | Auto | Creation timestamp |
| `updatedAt` | DateTime | Auto | Last update timestamp |

**Status Values**:
- `PENDING` - Checkout initiated
- `ACTIVE` - Valid subscription
- `PAST_DUE` - Payment failed
- `CANCELED` - Cancelled by user
- `EXPIRED` - Access ended

**Indexes**:
- `(userId)` - User's subscription
- `(status, expiresAt)` - Expiring subscriptions

**Relations**:
- `user`: User (N:1) - Owning user (cascade delete)

**TypeScript Interface**:
```typescript
interface Subscription {
  id: string;
  userId: string;
  status: "PENDING" | "ACTIVE" | "PAST_DUE" | "CANCELED" | "EXPIRED";
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  stripePriceId: string | null;
  stripePaymentMethodId: string | null;
  stripePaymentIntentId: string | null;
  stripePaymentStatus: string | null;
  currentPeriodStart: Date | null;
  currentPeriodEnd: Date | null;
  canceledAt: Date | null;
  cancelAtPeriodEnd: boolean;
  trialEndsAt: Date | null;
  expiresAt: Date | null;
  lastReminderSent: Date | null;
  reminderCount: number;
  createdAt: Date;
  updatedAt: Date;
  user?: User;
}
```

---

### AuditLog

Tracks all system actions for security and compliance.

**Table**: `AuditLog`

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | String | PK, cuid() | Unique identifier |
| `timestamp` | DateTime | Auto | When action occurred |
| `eventType` | String | Required | CREATE, UPDATE, DELETE, etc. |
| `userId` | String | FK, Optional | Acting user |
| `email` | String | Optional | User email snapshot |
| `ipAddress` | String | Optional | Client IP |
| `userAgent` | String | Optional | Client user agent |
| `correlationId` | String | Optional | Request trace ID |
| `metadata` | String | Optional | JSON with before/after state |
| `result` | String | Required | "success" or "failure" |
| `errorMessage` | String | Optional | Error details if failed |

**Indexes**:
- `(userId)` - User's actions
- `(eventType)` - Action type queries
- `(timestamp)` - Time-based queries
- `(correlationId)` - Request tracing

**Relations**:
- `user`: User (N:1, optional) - Acting user (set null on delete)

**TypeScript Interface**:
```typescript
interface AuditLog {
  id: string;
  timestamp: Date;
  eventType: string;
  userId: string | null;
  email: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  correlationId: string | null;
  metadata: string | null;  // JSON string
  result: "success" | "failure";
  errorMessage: string | null;
  user?: User | null;
}
```

---

## NextAuth Models

### Account

OAuth provider account storage.

| Field | Type | Description |
|-------|------|-------------|
| `id` | String | Unique identifier |
| `userId` | String | FK to User |
| `type` | String | Account type |
| `provider` | String | OAuth provider (google, apple) |
| `providerAccountId` | String | Provider's user ID |
| `access_token` | String | OAuth access token |
| `refresh_token` | String | OAuth refresh token |
| `expires_at` | Int | Token expiration |
| `token_type` | String | Token type |
| `scope` | String | OAuth scopes |
| `id_token` | String | OIDC ID token |
| `session_state` | String | Session state |

**Unique Constraint**: `(provider, providerAccountId)`

### Session

Active user sessions.

| Field | Type | Description |
|-------|------|-------------|
| `id` | String | Unique identifier |
| `sessionToken` | String | Unique session token |
| `userId` | String | FK to User |
| `expires` | DateTime | Session expiration |

### VerificationToken

Email verification tokens.

| Field | Type | Description |
|-------|------|-------------|
| `identifier` | String | Email address |
| `token` | String | Verification token |
| `expires` | DateTime | Token expiration |

**Unique Constraint**: `(identifier, token)`

---

## JSON Field Conventions

Several fields store JSON as strings for PostgreSQL compatibility:

### ageGroups
```json
["5-7", "8-10", "11-13", "14+"]
```

### daysOfWeek
```json
["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
```

### metadata (AuditLog)
```json
{
  "before": { "isPublished": false },
  "after": { "isPublished": true },
  "action": "Provider published"
}
```

---

## Future Enhancements (Planned)

### PostGIS Geospatial
```prisma
model Provider {
  // ... existing fields
  location    Unsupported("geography(Point, 4326)")?

  @@index([location], type: Gist)
}
```

### Reviews
```prisma
model Review {
  id          String   @id @default(cuid())
  providerId  String
  userId      String
  rating      Int      // 1-5
  comment     String?
  createdAt   DateTime @default(now())

  provider    Provider @relation(fields: [providerId], references: [id])
  user        User     @relation(fields: [userId], references: [id])
}
```

### Favorites
```prisma
model Favorite {
  id          String   @id @default(cuid())
  userId      String
  providerId  String
  createdAt   DateTime @default(now())

  user        User     @relation(fields: [userId], references: [id])
  provider    Provider @relation(fields: [providerId], references: [id])

  @@unique([userId, providerId])
}
```

---

## Related Documentation

- [API Reference](../api/api-reference.md)
- [Architecture Overview](./high-level-architecture.md)
- [Prisma Schema](../../apps/web/prisma/schema.prisma)
