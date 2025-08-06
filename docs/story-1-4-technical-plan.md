# Story 1.4: Subscription Lifecycle Management - Technical Implementation Plan

## Overview
Implement automated subscription lifecycle management including renewal reminders, expiration handling, and premium feature access control.

## Architecture Decision

### Cron Job Implementation
**Recommended: Vercel Cron Functions**
- Native integration with our Vercel deployment
- Serverless execution model
- Built-in monitoring and logging
- Cost-effective for daily runs

**Alternative considered**: GitHub Actions
- Would require API endpoints to trigger
- More complex deployment model
- Better for CI/CD tasks than production crons

### Email Service Selection
**Recommended: Resend**
- Modern API with excellent DX
- React Email template support
- Built for transactional emails
- Generous free tier (3,000 emails/month)
- Easy integration with Next.js

**Alternatives considered**:
- SendGrid: More complex, enterprise-focused
- AWS SES: Requires more configuration
- Postmark: Similar to Resend but less modern API

## Implementation Plan

### Phase 1: Database Schema Updates

#### 1.1 Update Prisma Schema
```prisma
enum SubscriptionStatus {
  PENDING
  ACTIVE
  PAST_DUE
  CANCELED
  EXPIRED
}

model Subscription {
  id                   String             @id @default(cuid())
  userId               String             @unique
  stripeCustomerId     String?
  stripeSubscriptionId String?            @unique
  stripePriceId        String?
  status               SubscriptionStatus @default(PENDING)
  currentPeriodStart   DateTime?
  currentPeriodEnd     DateTime?
  cancelAtPeriodEnd    Boolean            @default(false)
  canceledAt           DateTime?
  expiresAt            DateTime?
  trialEndsAt          DateTime?
  
  // Audit fields
  lastReminderSentAt   DateTime?
  reminderCount        Int                @default(0)
  
  createdAt            DateTime           @default(now())
  updatedAt            DateTime           @updatedAt
  
  user                 User               @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([status, expiresAt])
  @@index([userId])
}
```

#### 1.2 Migration Strategy
1. Add new fields with defaults
2. Backfill existing subscriptions
3. Update application code
4. Remove deprecated fields

### Phase 2: Cron Job Implementation

#### 2.1 Vercel Cron Configuration
Create `/api/cron/subscription-lifecycle.ts`:

```typescript
import { NextRequest } from 'next/server';
import { processSubscriptionLifecycle } from '~/services/subscription-lifecycle';

export const config = {
  runtime: 'edge',
};

export async function GET(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const result = await processSubscriptionLifecycle();
    return Response.json({ 
      success: true, 
      processed: result 
    });
  } catch (error) {
    console.error('Subscription lifecycle cron error:', error);
    return Response.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}
```

Add to `vercel.json`:
```json
{
  "crons": [{
    "path": "/api/cron/subscription-lifecycle",
    "schedule": "0 9 * * *"  // Daily at 9 AM Sydney time
  }]
}
```

#### 2.2 Lifecycle Service Implementation
```typescript
// ~/services/subscription-lifecycle.ts

export async function processSubscriptionLifecycle() {
  const results = {
    reminders: 0,
    expired: 0,
    errors: []
  };

  // Process renewal reminders
  const reminderResults = await sendRenewalReminders();
  results.reminders = reminderResults.sent;

  // Process expirations
  const expirationResults = await processExpiredSubscriptions();
  results.expired = expirationResults.processed;

  // Log results
  await logLifecycleRun(results);

  return results;
}
```

### Phase 3: Email Integration

#### 3.1 Resend Setup
```bash
pnpm add resend react-email @react-email/components
```

#### 3.2 Email Templates
Create `/emails/subscription-renewal-reminder.tsx`:

```tsx
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components';

interface RenewalReminderEmailProps {
  userName: string;
  expirationDate: string;
  renewalUrl: string;
}

export default function RenewalReminderEmail({
  userName,
  expirationDate,
  renewalUrl,
}: RenewalReminderEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Your subscription expires in 7 days</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Subscription Renewal Reminder</Heading>
          <Text style={text}>Hi {userName},</Text>
          <Text style={text}>
            Your Holiday Program Aggregator subscription will expire on{' '}
            <strong>{expirationDate}</strong>.
          </Text>
          <Section style={buttonContainer}>
            <Button style={button} href={renewalUrl}>
              Renew Subscription
            </Button>
          </Section>
          <Text style={text}>
            Don't lose access to:
          </Text>
          <ul>
            <li>Unlimited program searches</li>
            <li>Advanced filters and maps</li>
            <li>Email notifications</li>
            <li>Saved preferences</li>
          </ul>
        </Container>
      </Body>
    </Html>
  );
}
```

#### 3.3 Email Service
```typescript
// ~/services/email.ts
import { Resend } from 'resend';
import RenewalReminderEmail from '~/emails/subscription-renewal-reminder';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendRenewalReminder(
  email: string,
  data: {
    userName: string;
    expirationDate: string;
    renewalUrl: string;
  }
) {
  const result = await resend.emails.send({
    from: 'Holiday Programs <noreply@holidayprograms.com.au>',
    to: email,
    subject: 'Your subscription expires in 7 days',
    react: RenewalReminderEmail(data),
  });

  return result;
}
```

### Phase 4: Access Control Implementation

#### 4.1 Subscription Status Hook
```typescript
// ~/hooks/useSubscriptionStatus.ts
export function useSubscriptionStatus() {
  const { data: session } = useSession();
  const { data: subscription, isLoading } = api.subscription.getStatus.useQuery(
    undefined,
    { enabled: !!session }
  );

  const hasActiveSubscription = subscription?.status === 'ACTIVE';
  const isExpired = subscription?.status === 'EXPIRED';
  const expiresAt = subscription?.expiresAt;

  return {
    hasActiveSubscription,
    isExpired,
    expiresAt,
    isLoading,
  };
}
```

#### 4.2 Premium Feature Guard
```typescript
// ~/components/PremiumFeatureGuard.tsx
export function PremiumFeatureGuard({ 
  children,
  fallback = <SubscriptionPrompt />
}: { 
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const { hasActiveSubscription, isLoading } = useSubscriptionStatus();

  if (isLoading) return <LoadingSpinner />;
  if (!hasActiveSubscription) return <>{fallback}</>;

  return <>{children}</>;
}
```

#### 4.3 API Route Protection
```typescript
// ~/server/api/middleware/requireActiveSubscription.ts
export const requireActiveSubscription = t.middleware(async ({ ctx, next }) => {
  if (!ctx.session?.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }

  const subscription = await ctx.db.subscription.findUnique({
    where: { userId: ctx.session.user.id },
    select: { status: true, expiresAt: true }
  });

  if (!subscription || subscription.status !== 'ACTIVE') {
    throw new TRPCError({ 
      code: 'FORBIDDEN',
      message: 'Active subscription required'
    });
  }

  return next({
    ctx: {
      ...ctx,
      subscription,
    },
  });
});
```

### Phase 5: Testing Strategy

#### 5.1 Unit Tests
- Subscription status calculations
- Email template rendering
- Access control logic

#### 5.2 Integration Tests
- Cron job processing
- Email sending (mock)
- Database updates

#### 5.3 E2E Tests
- Subscription expiration flow
- Access restriction for expired users
- Renewal reminder delivery

### Phase 6: Monitoring & Observability

#### 6.1 Metrics to Track
- Daily cron execution status
- Reminders sent count
- Subscriptions expired count
- Email delivery success rate
- Access denials due to expired subscriptions

#### 6.2 Alerts
- Cron job failures
- High email bounce rate
- Unusual expiration patterns

## Implementation Timeline

### Week 1
- Day 1-2: Database schema updates and migration
- Day 3-4: Cron job infrastructure setup
- Day 5: Basic lifecycle processing logic

### Week 2
- Day 1-2: Email service integration
- Day 3-4: Access control implementation
- Day 5: Testing and refinement

### Week 3
- Day 1-2: Monitoring setup
- Day 3-4: Documentation and deployment
- Day 5: Production validation

## Security Considerations

1. **Cron Authentication**: Use secret token to prevent unauthorized execution
2. **Email Security**: Verify email ownership before sending
3. **Rate Limiting**: Prevent email spam
4. **Audit Trail**: Log all subscription state changes
5. **Data Privacy**: Don't expose subscription details in URLs

## Rollback Plan

1. Feature flag for new subscription logic
2. Parallel run with logging only (no actions)
3. Gradual rollout by user percentage
4. Quick disable via environment variable

## Success Metrics

- 95%+ of expiring subscriptions receive reminders
- < 5% of reminders bounce or fail
- 0 unauthorized access to premium features
- 30%+ renewal rate from reminder emails

## Dependencies

- Resend account and API key
- Vercel Pro plan (for cron jobs)
- Updated privacy policy for email communications
- Customer support documentation