# Stripe Price Setup Guide

## The Issue
You're getting a "No such price" error because the price ID in your `.env` file doesn't exist in your Stripe account.

## Quick Fix

### Step 1: Create a Product and Price in Stripe

1. Go to your Stripe Dashboard: https://dashboard.stripe.com/test/products
2. Click **"Add product"**
3. Fill in:
   - **Name**: Holiday Program Finder - Annual
   - **Price**: $39.00 AUD (or your preferred price)
   - **Billing period**: Yearly
4. Click **"Save product"**

### Step 2: Copy the Price ID

1. After creating the product, you'll see it in your products list
2. Click on the product name
3. Find the **Price ID** (it starts with `price_`)
4. Copy this ID

### Step 3: Update Your Environment

1. Open `apps/web/.env`
2. Find these lines (they might be commented out):
   ```
   # STRIPE_SECRET_KEY="sk_test_..."
   # STRIPE_ANNUAL_PRICE_ID="price_..."
   ```
3. Uncomment them (remove the `#`) and update with your values:
   ```
   STRIPE_SECRET_KEY="sk_test_YOUR_KEY_HERE"
   STRIPE_ANNUAL_PRICE_ID="price_YOUR_PRICE_ID_HERE"
   ```

### Step 4: Restart the Server

The server should automatically reload, but if not:
1. Stop the server (Ctrl+C)
2. Run `pnpm dev` again

## Alternative: Use Stripe CLI to Create a Price

If you have Stripe CLI installed:

```bash
# Create a product and price
stripe products create \
  --name="Holiday Program Finder - Annual" \
  --description="Annual subscription to Holiday Program Finder" \
  --test

# This will output a product ID, use it here:
stripe prices create \
  --product="prod_YOUR_PRODUCT_ID" \
  --unit-amount=3900 \
  --currency=aud \
  --recurring[interval]=year \
  --test
```

## Verify Your Setup

After updating your `.env`, the subscription flow should work:
1. Visit http://localhost:3000/subscription
2. Click "Subscribe Now"
3. You should be redirected to Stripe Checkout

## Common Issues

- **Still getting "No such price" error**: Make sure you're using the price ID from your TEST mode dashboard, not live mode
- **Authentication errors**: Ensure your `STRIPE_SECRET_KEY` starts with `sk_test_`
- **Webhook errors**: For local testing, webhooks are optional. They're only needed for automatic subscription updates