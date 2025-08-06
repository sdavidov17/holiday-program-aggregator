# Stripe Setup Guide

## Overview
This guide helps you set up Stripe integration for the Holiday Program Aggregator subscription system.

## Prerequisites
1. A Stripe account (create one at https://stripe.com)
2. Access to your Stripe Dashboard

## Important: Webhooks for Testing

**For basic testing (creating subscriptions), you DON'T need to configure webhooks immediately.**

Webhooks are only needed for:
- Real-time subscription status updates
- Handling payment failures
- Processing subscription cancellations
- Updating subscription status when payments succeed/fail

**You CAN test subscription creation without webhooks**, but the subscription status won't update automatically in your database after payment.

## Setup Steps

### 1. Get Your API Keys
1. Log in to your [Stripe Dashboard](https://dashboard.stripe.com/)
2. Navigate to **Developers** → **API keys**
3. Copy your keys:
   - **Publishable key** (starts with `pk_test_` or `pk_live_`)
   - **Secret key** (starts with `sk_test_` or `sk_live_`)

### 2. Create a Product and Price
1. Go to **Products** in your Stripe Dashboard
2. Click **+ Add product**
3. Fill in the product details:
   - **Name**: "Holiday Program Aggregator Annual Subscription"
   - **Description**: "Annual subscription for unlimited access to holiday program search"
4. Add pricing:
   - **Pricing model**: Standard pricing
   - **Price**: $99.00 AUD
   - **Billing period**: Yearly
5. Save the product
6. Copy the **Price ID** (starts with `price_`)

### 3. Set Up Webhook Endpoint
1. Go to **Developers** → **Webhooks**
2. Click **+ Add endpoint**
3. Set the endpoint URL:
   - For local development: Use [ngrok](https://ngrok.com/) or similar to expose your local server
     ```
     https://your-ngrok-url.ngrok.io/api/stripe/webhook
     ```
   - For production: 
     ```
     https://your-domain.com/api/stripe/webhook
     ```
4. Select events to listen to:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Copy the **Webhook signing secret** (starts with `whsec_`)

### 4. Configure Environment Variables
Update your `.env` file with the following values:

```env
# Stripe Configuration
STRIPE_SECRET_KEY="sk_test_..." # Your secret key from step 1
STRIPE_WEBHOOK_SECRET="whsec_..." # Your webhook signing secret from step 3
STRIPE_ANNUAL_PRICE_ID="price_..." # Your price ID from step 2
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..." # Your publishable key from step 1
```

### 5. Test Your Setup
1. Start your development server:
   ```bash
   pnpm dev
   ```

2. If testing locally, start ngrok:
   ```bash
   ngrok http 3000
   ```

3. Update your webhook endpoint in Stripe with the ngrok URL

4. Try creating a subscription:
   - Log in to your application
   - Go to your profile page
   - Click "Manage Subscription"
   - Click "Subscribe Now"

5. Use test card numbers:
   - Success: `4242 4242 4242 4242`
   - Requires authentication: `4000 0025 0000 3155`
   - Insufficient funds: `4000 0000 0000 9995`

## Troubleshooting

### "Stripe configuration is missing" Error
This error occurs when the required Stripe environment variables are not set. Check that you have:
- `STRIPE_SECRET_KEY`
- `STRIPE_ANNUAL_PRICE_ID`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`

### "Invalid price ID" Error
Make sure your `STRIPE_ANNUAL_PRICE_ID` is a valid Stripe price ID that starts with `price_`.

### Webhook Errors
1. Check that your webhook endpoint is accessible
2. Verify the webhook signing secret is correct
3. Check the Stripe Dashboard webhook logs for details

### Local Development with Webhooks
For local webhook testing, you can use Stripe CLI:

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login to your Stripe account
stripe login

# Forward webhooks to your local server
stripe listen --forward-to localhost:3000/api/stripe/webhook

# The CLI will show you the webhook signing secret to use
```

## Production Checklist
- [ ] Switch from test keys to live keys
- [ ] Update webhook endpoint to production URL
- [ ] Ensure HTTPS is enabled on your domain
- [ ] Test with a real card to verify everything works
- [ ] Set up monitoring for failed payments
- [ ] Configure email notifications through Resend

## Additional Resources
- [Stripe Checkout Documentation](https://stripe.com/docs/payments/checkout)
- [Stripe Webhooks Guide](https://stripe.com/docs/webhooks)
- [Stripe Testing Guide](https://stripe.com/docs/testing)