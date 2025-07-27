# Epic 1: Foundation, Provider Management & Subscriptions
## Story 1.3: Subscription & Payment Integration

*As a new user, I want to be able to pay for an annual subscription, so that I can access the service.*

### Acceptance Criteria
1. The application integrates with Stripe.
2. A logged-in user without a subscription is prompted to subscribe.
3. A user can successfully purchase a subscription.
4. Upon payment, the user's account is marked as 'active'.

### Development Tasks
- [ ] Add a `Subscription` model to the Prisma schema, linking it to the `User` model.
- [ ] Configure the Stripe SDK and API keys in the project's environment variables.
- [ ] Create a tRPC procedure (`createCheckoutSession`) that uses the Stripe SDK to create a new checkout session for the annual subscription product.
- [ ] Implement a UI component that displays a "Subscribe" button for logged-in users who do not have an active subscription.
- [ ] On button click, call the `createCheckoutSession` procedure and redirect the user to the Stripe Checkout page.
- [ ] Create a new API route (`/api/stripe-webhook`) to handle incoming webhooks from Stripe.
- [ ] Implement the webhook handler to listen for the `checkout.session.completed` event.
- [ ] In the webhook handler, update the user's `Subscription` record in the database to mark their subscription as 'active'.
- [ ] Test the full end-to-end flow in a development environment using Stripe's test mode and test cards.