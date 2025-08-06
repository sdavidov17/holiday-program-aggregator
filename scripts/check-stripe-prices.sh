#!/bin/bash

# Script to check Stripe prices using the API

echo "🔍 Checking Stripe prices..."
echo ""

# Load environment variables
if [ -f "apps/web/.env" ]; then
    # Read the env file and export variables
    while IFS='=' read -r key value; do
        # Skip comments and empty lines
        if [[ ! "$key" =~ ^# ]] && [[ -n "$key" ]]; then
            # Remove quotes if present
            value="${value%\"}"
            value="${value#\"}"
            value="${value%\'}"
            value="${value#\'}"
            
            # Export only the variables we need
            if [[ "$key" == "STRIPE_SECRET_KEY" ]] || [[ "$key" == "STRIPE_ANNUAL_PRICE_ID" ]]; then
                export "$key=$value"
            fi
        fi
    done < apps/web/.env
fi

if [ -z "$STRIPE_SECRET_KEY" ]; then
    echo "❌ STRIPE_SECRET_KEY not found in apps/web/.env"
    echo "Please ensure your .env file has STRIPE_SECRET_KEY set"
    exit 1
fi

echo "Current configuration:"
echo "STRIPE_ANNUAL_PRICE_ID: ${STRIPE_ANNUAL_PRICE_ID:-Not set}"
echo ""

# List all prices
echo "📋 Fetching all prices from Stripe..."
echo ""

response=$(curl -s -u "$STRIPE_SECRET_KEY:" \
  "https://api.stripe.com/v1/prices?limit=100&expand[]=data.product")

# Check if request was successful
if [ $? -ne 0 ]; then
    echo "❌ Failed to connect to Stripe API"
    exit 1
fi

# Check for errors
if echo "$response" | grep -q '"error"'; then
    echo "❌ Stripe API Error:"
    echo "$response" | jq -r '.error.message'
    exit 1
fi

# Parse and display prices
echo "$response" | jq -r '
  .data[] | 
  "\(.product.name // "Unknown Product") 
   Price ID: \(.id)
   Amount: \(.currency | ascii_upcase) $\((.unit_amount // 0) / 100)
   Billing: \(if .recurring then "\(.recurring.interval) (\(.recurring.interval_count // 1)x)" else "one-time" end)
   Active: \(if .active then "✅" else "❌" end)
   Created: \(.created | strftime("%Y-%m-%d"))
   "
' 2>/dev/null || {
    echo "❌ Failed to parse response. Raw response:"
    echo "$response" | head -100
    echo ""
    echo "Make sure you have 'jq' installed: brew install jq"
}

echo ""
echo "📝 To use one of these prices:"
echo "1. Copy the Price ID from above"
echo "2. Update STRIPE_ANNUAL_PRICE_ID in apps/web/.env"
echo "3. Restart the development server"

# Check if current price exists
if [ -n "$STRIPE_ANNUAL_PRICE_ID" ]; then
    echo ""
    echo "🔍 Checking current price ID: $STRIPE_ANNUAL_PRICE_ID"
    
    price_check=$(curl -s -u "$STRIPE_SECRET_KEY:" \
      "https://api.stripe.com/v1/prices/$STRIPE_ANNUAL_PRICE_ID")
    
    if echo "$price_check" | grep -q '"id"'; then
        echo "✅ This price ID exists in your Stripe account"
    else
        echo "❌ This price ID does not exist in your Stripe account!"
        echo "Error: $(echo "$price_check" | jq -r '.error.message' 2>/dev/null)"
    fi
fi