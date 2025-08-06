#!/bin/bash

# Quick script to check Stripe prices from .env.local

echo "🔍 Checking your Stripe prices..."

# Get the secret key from .env.local
STRIPE_KEY=$(grep "^STRIPE_SECRET_KEY=" apps/web/.env.local | cut -d'"' -f2)

if [ -z "$STRIPE_KEY" ]; then
    echo "❌ No STRIPE_SECRET_KEY found in apps/web/.env.local"
    exit 1
fi

echo "📋 Fetching all prices from your Stripe account..."
echo ""

# List all prices with product details
curl -s -u "$STRIPE_KEY:" \
  "https://api.stripe.com/v1/prices?limit=100&expand[]=data.product" | \
  jq -r '.data[] | 
    "Product: \(.product.name // "Unknown")
Price ID: \(.id)
Amount: $\((.unit_amount // 0) / 100) \(.currency | ascii_upcase)
Billing: \(if .recurring then .recurring.interval else "one-time" end)
Active: \(if .active then "✅" else "❌" end)
---"'

echo ""
echo "📝 To fix the 'No such price' error:"
echo "1. Copy a Price ID from above"
echo "2. Update STRIPE_ANNUAL_PRICE_ID in apps/web/.env.local"
echo "3. The server will auto-reload"