# Epic 1: Foundation, Provider Management & Subscriptions
## Story 1.4: Subscription Lifecycle Management

*As the business, I want the system to manage subscription status, so that we can handle renewals and expirations automatically.*

### Acceptance Criteria
1. The system sends a renewal reminder 7 days before expiration.
2. If a subscription expires, their status is updated to 'expired'.
3. Expired users are restricted from premium features.

### Development Tasks
- [ ] Add a `status` field (e.g., 'active', 'expired', 'canceled') and an `expiresAt` timestamp to the `Subscription` model in the Prisma schema.
- [ ] Create a scheduled serverless function (cron job) that runs daily to check for subscriptions nearing expiration.
- [ ] Implement logic within the cron job to identify subscriptions that will expire in exactly 7 days.
- [ ] Integrate a third-party email service (e.g., SendGrid, Resend) to send a transactional "Subscription Renewal Reminder" email to the relevant users.
- [ ] Implement logic within the daily cron job to find subscriptions where `expiresAt` is in the past and the `status` is still 'active'.
- [ ] For expired subscriptions, update the `status` field in the database to 'expired'.
- [ ] Create a middleware or higher-order component (HOC) to protect premium features and routes.
- [ ] The protection logic should check the user's subscription status and deny access to users with an 'expired' or non-existent subscription.
- [ ] Apply the protection logic to all relevant premium features.