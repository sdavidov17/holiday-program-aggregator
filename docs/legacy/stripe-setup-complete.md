# Complete Stripe Setup Guide

This comprehensive guide covers everything you need to set up Stripe for the Holiday Program Aggregator subscription system.

## Table of Contents
1. [Quick Start (5 minutes)](#quick-start)
2. [Full Setup with Webhooks](#full-setup)
3. [Testing Guide](#testing-guide)
4. [Troubleshooting](#troubleshooting)
5. [Production Checklist](#production-checklist)

---

## Quick Start

### Minimum Setup for Testing (5 minutes)

#### 1. Create a Stripe Account
- Go to [stripe.com](https://stripe.com) and sign up
- Make sure you're in **Test mode** (toggle in the top right of dashboard)

#### 2. Get Your Test API Keys
1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Navigate to **Developers** → **API keys**
3. Copy:
   - **Publishable key**: `pk_test_...`
   - **Secret key**: `sk_test_...`

#### 3. Create a Test Product
1. Go to **Products** → **+ Add product**
2. Enter:
   - **Name**: "Holiday Program Finder - Annual"
   - **Price**: $99.00 AUD
   - **Billing period**: Yearly
3. Save and copy the **Price ID** (starts with `price_`)

#### 4. Update Your Environment
Add to `apps/web/.env` or `apps/web/.env.local`:

```env
STRIPE_SECRET_KEY="sk_test_YOUR_KEY_HERE"
STRIPE_ANNUAL_PRICE_ID="price_YOUR_PRICE_ID_HERE"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_YOUR_KEY_HERE"

# Dummy webhook secret for basic testing (optional)
STRIPE_WEBHOOK_SECRET="whsec_dummy_for_testing"
```

#### 5. Test It!
1. Start dev server: `pnpm dev`
2. Sign in → Profile → Manage Subscription → Subscribe Now
3. Use test card: `4242 4242 4242 4242` (any future expiry, any CVC)

### What Works Without Webhooks?
✅ Creating new subscriptions  
✅ Stripe Checkout flow  
✅ Payment processing  
✅ Redirect to success page  

### What Requires Webhooks?
❌ Automatic status updates in database  
❌ Subscription cancellations syncing  
❌ Payment failure handling  
❌ Renewal notifications  

---

## Full Setup

### Complete Setup with Webhooks

#### 1. Set Up Webhook Endpoint

##### Option A: Using ngrok (Recommended for local development)
```bash
# Run the setup script
./scripts/setup-ngrok-stripe.sh

# Or manually:
ngrok http 3000
# Copy the HTTPS URL (e.g., https://abc123.ngrok.io)
```

##### Option B: Using Stripe CLI
```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login and forward webhooks
stripe login
stripe listen --forward-to localhost:3000/api/stripe/webhook
# Copy the webhook signing secret shown
```

#### 2. Configure Webhook in Stripe Dashboard
1. Go to **Developers** → **Webhooks**
2. Click **+ Add endpoint**
3. Set endpoint URL:
   - Local: `https://YOUR-NGROK-URL.ngrok.io/api/stripe/webhook`
   - Production: `https://your-domain.com/api/stripe/webhook`
4. Select events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Copy the **Webhook signing secret** (`whsec_...`)

#### 3. Update Environment with Webhook Secret
```env
STRIPE_WEBHOOK_SECRET="whsec_YOUR_WEBHOOK_SECRET_HERE"
```

---

## Testing Guide

### Test Card Numbers
- **Success**: `4242 4242 4242 4242`
- **Requires authentication**: `4000 0025 0000 3155`
- **Insufficient funds**: `4000 0000 0000 9995`
- **Card declined**: `4000 0000 0000 0002`

### Testing Scenarios
1. **New Subscription**: Complete checkout with test card
2. **Failed Payment**: Use insufficient funds card
3. **Cancellation**: Visit subscription page → Cancel
4. **Webhook Verification**: Check Stripe Dashboard → Webhooks → Recent deliveries

### Verifying Webhook Integration
```bash
# Check webhook logs
tail -f apps/web/dev.log | grep webhook

# Test webhook manually (requires Stripe CLI)
stripe trigger checkout.session.completed
```

---

## Troubleshooting

### Common Errors and Solutions

#### "Stripe configuration is missing"
**Cause**: Missing environment variables  
**Solution**: Ensure all required variables are set:
- `STRIPE_SECRET_KEY`
- `STRIPE_ANNUAL_PRICE_ID`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`

#### "No such price: price_..."
**Cause**: Price ID doesn't exist or wrong mode (test/live)  
**Solution**: 
1. Verify you're in test mode in Stripe Dashboard
2. Create a new price or copy correct price ID
3. Update `STRIPE_ANNUAL_PRICE_ID`

#### "Invalid webhook signature"
**Cause**: Wrong webhook secret or payload tampering  
**Solution**:
1. Copy webhook secret from Stripe Dashboard → Webhooks → Your endpoint
2. Update `STRIPE_WEBHOOK_SECRET`
3. Ensure no proxy is modifying the request body

#### Subscription not updating after payment
**Cause**: Webhooks not configured  
**Solution**: Follow the Full Setup guide to configure webhooks

### Debug Tips
1. Check Stripe Dashboard → Developers → Logs
2. Enable Prisma query logging: `DEBUG=prisma:query pnpm dev`
3. Check webhook status: Stripe Dashboard → Webhooks → Recent deliveries

---

## Production Checklist

### Before Going Live
- [ ] Switch to live API keys (remove `_test` from keys)
- [ ] Create production product and price in live mode
- [ ] Update webhook endpoint to production URL
- [ ] Ensure HTTPS is enabled on your domain
- [ ] Update environment variables on production server
- [ ] Test with a real card in live mode
- [ ] Set up error monitoring (e.g., Sentry)
- [ ] Configure email notifications through Resend
- [ ] Set up subscription lifecycle cron job
- [ ] Enable Stripe's fraud protection tools

### Security Considerations
1. Never commit API keys to version control
2. Use environment variables for all sensitive data
3. Validate webhook signatures on every request
4. Implement rate limiting on API endpoints
5. Log all subscription changes for audit trail

### Monitoring
1. Set up alerts for failed payments
2. Monitor subscription churn rate
3. Track webhook delivery success rate
4. Review Stripe Radar for fraud attempts

---

## Additional Resources
- [Stripe Checkout Documentation](https://stripe.com/docs/payments/checkout)
- [Stripe Webhooks Guide](https://stripe.com/docs/webhooks)
- [Stripe Testing Guide](https://stripe.com/docs/testing)
- [Stripe Security Best Practices](https://stripe.com/docs/security)

## Support
- Stripe Support: https://support.stripe.com/
- Project Issues: https://github.com/your-repo/issues