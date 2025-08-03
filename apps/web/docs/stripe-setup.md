# Stripe Setup Guide

This guide will help you set up Stripe for subscription payments in the Holiday Program Aggregator.

## Prerequisites

1. Create a Stripe account at https://stripe.com
2. Access your Stripe Dashboard at https://dashboard.stripe.com/

## Setup Steps

### 1. Get Your API Keys

1. In the Stripe Dashboard, navigate to "Developers" → "API keys"
2. Copy your **Publishable key** (starts with `pk_test_` in test mode)
3. Copy your **Secret key** (starts with `sk_test_` in test mode)

### 2. Create a Product and Price

1. Go to "Products" in the Stripe Dashboard
2. Click "Add product"
3. Fill in the details:
   - Name: "Holiday Program Aggregator Annual Subscription"
   - Description: "Annual subscription to Holiday Program Aggregator"
4. In the Pricing section:
   - Choose "Recurring"
   - Price: $99.00 AUD
   - Billing period: Yearly
5. Save the product
6. Copy the **Price ID** (starts with `price_`)

### 3. Set Up Webhook Endpoint

1. Go to "Developers" → "Webhooks"
2. Click "Add endpoint"
3. Endpoint URL: 
   - Development: `http://localhost:3000/api/stripe-webhook`
   - Production: `https://your-domain.com/api/stripe-webhook`
4. Select events to listen to:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
5. Save the endpoint
6. Copy the **Signing secret** (starts with `whsec_`)

### 4. Configure Environment Variables

Add the following to your `.env` file:

```env
# Stripe Configuration
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
STRIPE_ANNUAL_PRICE_ID="price_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
```

### 5. Test Your Integration

1. Use Stripe's test card numbers:
   - Success: `4242 4242 4242 4242`
   - Requires authentication: `4000 0025 0000 3155`
   - Declined: `4000 0000 0000 9995`

2. Test the full flow:
   - Sign in to your application
   - Click "Subscribe Now"
   - Complete the Stripe Checkout
   - Verify subscription is activated

### 6. Webhook Testing (Local Development)

For local webhook testing, use Stripe CLI:

1. Install Stripe CLI: https://stripe.com/docs/stripe-cli
2. Login: `stripe login`
3. Forward webhooks to localhost:
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe-webhook
   ```
4. Copy the webhook signing secret shown in the terminal
5. Update your `.env` with this temporary webhook secret

### 7. Going to Production

Before going live:

1. Switch to live API keys (remove `test_` from keys)
2. Update webhook endpoint URL to your production domain
3. Create production product and price
4. Update environment variables in production
5. Test with a real card (you can refund yourself)

## Troubleshooting

### "Invalid client" error
- Ensure all API keys are correctly set in `.env`
- Restart your development server after changing environment variables

### Webhook signature verification failed
- Make sure you're using the correct webhook secret
- For local testing, use the secret from Stripe CLI
- Ensure the raw request body is being passed to verification

### Subscription not activating
- Check webhook logs in Stripe Dashboard
- Verify webhook endpoint is receiving events
- Check server logs for processing errors

## Additional Resources

- [Stripe Checkout Documentation](https://stripe.com/docs/payments/checkout)
- [Stripe Subscriptions Guide](https://stripe.com/docs/billing/subscriptions/overview)
- [Webhook Best Practices](https://stripe.com/docs/webhooks/best-practices)