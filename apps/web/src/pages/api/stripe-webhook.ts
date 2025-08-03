import { type NextApiRequest, type NextApiResponse } from "next";
import { buffer } from "micro";
import type Stripe from "stripe";
import { db } from "~/server/db";
import { constructWebhookEvent, getSubscription } from "~/utils/stripe";

// Stripe requires the raw body to verify webhook signatures
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    res.status(405).end("Method Not Allowed");
    return;
  }

  const sig = req.headers["stripe-signature"];

  if (!sig || typeof sig !== "string") {
    res.status(400).send("Missing stripe-signature header");
    return;
  }

  let event: Stripe.Event;

  try {
    const rawBody = await buffer(req);
    event = await constructWebhookEvent(rawBody, sig);
  } catch (err) {
    console.error("Webhook Error:", err);
    res.status(400).send(`Webhook Error: ${err instanceof Error ? err.message : "Unknown error"}`);
    return;
  }

  // Handle the event
  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        
        if (session.mode === "subscription") {
          const userId = session.metadata?.userId;
          const customerId = session.customer as string;
          const subscriptionId = session.subscription as string;

          if (!userId) {
            console.error("No userId in session metadata");
            break;
          }

          // Get subscription details from Stripe
          const subscription = await getSubscription(subscriptionId);

          // Update subscription in database
          await db.subscription.update({
            where: {
              userId,
            },
            data: {
              stripeSubscriptionId: subscriptionId,
              stripePaymentStatus: "paid",
              status: "active",
              currentPeriodStart: "current_period_start" in subscription && typeof subscription.current_period_start === "number" ? new Date(subscription.current_period_start * 1000) : null,
              currentPeriodEnd: "current_period_end" in subscription && typeof subscription.current_period_end === "number" ? new Date(subscription.current_period_end * 1000) : null,
            },
          });

          console.log(`Subscription activated for user ${userId}`);
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata.userId;

        if (!userId) {
          console.error("No userId in subscription metadata");
          break;
        }

        // Update subscription status
        await db.subscription.update({
          where: {
            stripeSubscriptionId: subscription.id,
          },
          data: {
            status: subscription.status === "active" ? "active" : "inactive",
            currentPeriodStart: "current_period_start" in subscription && typeof subscription.current_period_start === "number" ? new Date(subscription.current_period_start * 1000) : null,
            currentPeriodEnd: "current_period_end" in subscription && typeof subscription.current_period_end === "number" ? new Date(subscription.current_period_end * 1000) : null,
            cancelAtPeriodEnd: subscription.cancel_at_period_end,
          },
        });

        console.log(`Subscription updated for user ${userId}`);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        
        // Update subscription status to cancelled
        await db.subscription.update({
          where: {
            stripeSubscriptionId: subscription.id,
          },
          data: {
            status: "cancelled",
          },
        });

        console.log(`Subscription cancelled for subscription ${subscription.id}`);
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = "subscription" in invoice && typeof invoice.subscription === "string" ? invoice.subscription : undefined;

        if (subscriptionId) {
          // Update payment status
          await db.subscription.update({
            where: {
              stripeSubscriptionId: subscriptionId,
            },
            data: {
              stripePaymentStatus: "failed",
            },
          });

          console.log(`Payment failed for subscription ${subscriptionId}`);
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error("Error processing webhook:", error);
    res.status(500).send("Webhook processing error");
  }
}