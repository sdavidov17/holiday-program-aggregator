import { env } from "../env.mjs";
import Stripe from "stripe";

const stripe = env.STRIPE_SECRET_KEY 
  ? new Stripe(env.STRIPE_SECRET_KEY, {
      apiVersion: "2025-07-30.basil",
    })
  : null;

async function checkPrices() {
  console.log('🔍 Checking Stripe prices...\n');

  if (!stripe) {
    console.error('❌ STRIPE_SECRET_KEY not found in environment variables');
    console.error('Please ensure apps/web/.env has STRIPE_SECRET_KEY set');
    process.exit(1);
  }

  try {
    // List all prices
    const prices = await stripe.prices.list({
      limit: 100,
      expand: ['data.product'],
    });

    if (prices.data.length === 0) {
      console.log('⚠️  No prices found in your Stripe account');
      console.log('\nTo create a test price:');
      console.log('1. Go to https://dashboard.stripe.com/test/products');
      console.log('2. Click "Add product"');
      console.log('3. Name: "Holiday Program Finder - Annual"');
      console.log('4. Price: $39.00 AUD');
      console.log('5. Billing period: Yearly');
      console.log('6. Save the product');
      console.log('7. Copy the price ID and update STRIPE_ANNUAL_PRICE_ID in apps/web/.env');
      return;
    }

    console.log(`Found ${prices.data.length} price(s):\n`);

    // Display each price
    prices.data.forEach((price, index) => {
      const product = price.product;
      const productName = typeof product === 'object' && 'name' in product ? product.name : 'Unknown Product';
      const amount = price.unit_amount ? (price.unit_amount / 100).toFixed(2) : 'Custom';
      const interval = price.recurring ? price.recurring.interval : 'one-time';
      const intervalCount = price.recurring?.interval_count || 1;
      
      console.log(`${index + 1}. ${productName}`);
      console.log(`   Price ID: ${price.id}`);
      console.log(`   Amount: $${amount} ${price.currency.toUpperCase()}`);
      console.log(`   Billing: ${intervalCount > 1 ? `Every ${intervalCount} ${interval}s` : interval}`);
      console.log(`   Active: ${price.active ? '✅' : '❌'}`);
      console.log(`   Created: ${new Date(price.created * 1000).toLocaleDateString()}`);
      console.log('');
    });

    console.log('\n📝 To use one of these prices:');
    console.log('1. Copy the Price ID from above');
    console.log('2. Update STRIPE_ANNUAL_PRICE_ID in apps/web/.env');
    console.log('3. Restart the development server');

    // Check current price ID
    const currentPriceId = env.STRIPE_ANNUAL_PRICE_ID;
    if (currentPriceId) {
      console.log(`\n🔍 Current STRIPE_ANNUAL_PRICE_ID: ${currentPriceId}`);
      const priceExists = prices.data.some(p => p.id === currentPriceId);
      if (!priceExists) {
        console.log('❌ This price ID does not exist in your Stripe account!');
      } else {
        console.log('✅ This price ID exists in your Stripe account');
      }
    }

  } catch (error) {
    console.error('❌ Error fetching prices:', error);
    if (error instanceof Error && error.message.includes('Invalid API Key')) {
      console.error('\nPlease check that your STRIPE_SECRET_KEY is correct');
      console.error('Make sure you\'re using the test mode secret key (starts with sk_test_)');
    }
  }
}

// Run the check
checkPrices().catch(console.error);