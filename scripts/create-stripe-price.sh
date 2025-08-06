#!/bin/bash

echo "🚀 Creating a Stripe product and price for testing..."

# Get the secret key from .env.local
STRIPE_KEY=$(grep "^STRIPE_SECRET_KEY=" apps/web/.env.local | cut -d'"' -f2)

if [ -z "$STRIPE_KEY" ]; then
    echo "❌ No STRIPE_SECRET_KEY found in apps/web/.env.local"
    exit 1
fi

# Create a product
echo "📦 Creating product..."
PRODUCT_RESPONSE=$(curl -s -X POST https://api.stripe.com/v1/products \
  -u "$STRIPE_KEY:" \
  -d "name=Holiday Program Finder - Annual" \
  -d "description=Annual subscription to Holiday Program Finder")

PRODUCT_ID=$(echo "$PRODUCT_RESPONSE" | jq -r '.id')

if [ -z "$PRODUCT_ID" ] || [ "$PRODUCT_ID" = "null" ]; then
    echo "❌ Failed to create product"
    echo "$PRODUCT_RESPONSE" | jq .
    exit 1
fi

echo "✅ Created product: $PRODUCT_ID"

# Create a price
echo "💰 Creating price..."
PRICE_RESPONSE=$(curl -s -X POST https://api.stripe.com/v1/prices \
  -u "$STRIPE_KEY:" \
  -d "product=$PRODUCT_ID" \
  -d "unit_amount=3900" \
  -d "currency=aud" \
  -d "recurring[interval]=year")

PRICE_ID=$(echo "$PRICE_RESPONSE" | jq -r '.id')

if [ -z "$PRICE_ID" ] || [ "$PRICE_ID" = "null" ]; then
    echo "❌ Failed to create price"
    echo "$PRICE_RESPONSE" | jq .
    exit 1
fi

echo "✅ Created price: $PRICE_ID"
echo ""
echo "🎉 Success! Your new price ID is: $PRICE_ID"
echo ""
echo "📝 Next step: Update your apps/web/.env.local file:"
echo "STRIPE_ANNUAL_PRICE_ID=\"$PRICE_ID\""
echo ""
echo "The server will auto-reload after you save the file."