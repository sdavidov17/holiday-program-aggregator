# Stripe Quick Setup (Testing Only)

This is a simplified guide to get Stripe working quickly for testing subscriptions.

## Minimum Required Setup (5 minutes)

### 1. Create a Stripe Account
Go to [stripe.com](https://stripe.com) and sign up (if you haven't already).

### 2. Get Your Test API Keys
1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Make sure you're in **Test mode** (toggle in the top right)
3. Go to **Developers** → **API keys**
4. Copy these keys:
   - **Publishable key**: `pk_test_...`
   - **Secret key**: `sk_test_...`

### 3. Create a Test Product
1. Go to **Products** in your Stripe Dashboard
2. Click **+ Add product**
3. Enter:
   - Name: "Test Subscription"
   - Price: $99.00
   - Billing period: Monthly (or Yearly)
4. Save the product
5. Copy the **Price ID** (looks like `price_1234...`)

### 4. Update Your .env File
Create a `.env` file in `/apps/web/` with:

```env
# Copy from .env.example and add these:
STRIPE_SECRET_KEY="sk_test_YOUR_KEY_HERE"
STRIPE_ANNUAL_PRICE_ID="price_YOUR_PRICE_ID_HERE"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_YOUR_KEY_HERE"

# For now, use a dummy webhook secret (webhooks optional for testing)
STRIPE_WEBHOOK_SECRET="whsec_dummy_for_testing"
```

### 5. Test It!
1. Start your dev server: `pnpm dev`
2. Sign in to your app
3. Go to your profile → Manage Subscription
4. Click "Subscribe Now"
5. Use test card: `4242 4242 4242 4242` (any future expiry, any CVC)

## What Works Without Webhooks?
✅ Creating new subscriptions
✅ Stripe Checkout flow
✅ Payment processing
✅ Redirect to success page

## What Doesn't Work Without Webhooks?
❌ Automatic status updates in your database
❌ Subscription cancellations syncing to your app
❌ Payment failure handling
❌ Renewal notifications

## When Do You Need Webhooks?

You'll need to set up webhooks when:
1. Going to production
2. Testing the full subscription lifecycle
3. Need real-time updates in your app

For webhook setup, run:
```bash
./scripts/setup-ngrok-stripe.sh
```

Or see the full guide: [docs/stripe-setup.md](./stripe-setup.md)

## Common Issues

### "Stripe configuration is missing" Error
- Make sure all three Stripe keys are in your `.env` file
- Restart your dev server after adding them

### Price ID Invalid
- Make sure you copied the Price ID (not Product ID)
- Price IDs start with `price_`

### Can't See Subscription After Payment
- This is normal without webhooks!
- The subscription exists in Stripe but isn't synced to your database
- Set up webhooks to fix this

## Next Steps
Once basic testing works, set up webhooks for the full experience:
1. Use ngrok or Stripe CLI for local testing
2. Configure webhook endpoint in Stripe Dashboard
3. Update `STRIPE_WEBHOOK_SECRET` in your `.env`