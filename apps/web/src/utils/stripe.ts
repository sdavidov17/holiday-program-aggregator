import Stripe from "stripe";
import { env } from "~/env.mjs";

export const stripe = env.STRIPE_SECRET_KEY 
  ? new Stripe(
      env.STRIPE_SECRET_KEY,
      {
        apiVersion: "2025-07-30.basil",
        typescript: true,
      }
    )
  : ({} as Stripe); // Mock for tests when no key is provided

export const ANNUAL_SUBSCRIPTION_CONFIG = {
  mode: "subscription" as const,
  priceId: env.STRIPE_ANNUAL_PRICE_ID ?? "",
  recurring: {
    interval: "year" as const,
    interval_count: 1,
  },
};

export async function createStripeCustomer(
  email: string,
  userId: string,
  name?: string | null
) {
  const customer = await stripe.customers.create({
    email,
    name: name ?? undefined,
    metadata: {
      userId,
    },
  });
  
  return customer;
}

export async function createCheckoutSession(
  customerId: string,
  userId: string,
  priceId: string,
  successUrl: string,
  cancelUrl: string
) {
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    payment_method_types: ["card"],
    billing_address_collection: "required",
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    mode: "subscription",
    allow_promotion_codes: true,
    subscription_data: {
      metadata: {
        userId,
      },
    },
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      userId,
    },
  });

  return session;
}

export async function constructWebhookEvent(
  rawBody: string | Buffer,
  signature: string
) {
  try {
    const event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      env.STRIPE_WEBHOOK_SECRET ?? ""
    );
    return event;
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    throw new Error("Webhook signature verification failed");
  }
}

export async function getSubscription(subscriptionId: string) {
  return stripe.subscriptions.retrieve(subscriptionId);
}

export async function cancelSubscription(subscriptionId: string) {
  return stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: true,
  });
}