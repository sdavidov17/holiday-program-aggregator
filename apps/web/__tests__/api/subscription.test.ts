/* global describe, it, expect, beforeEach, afterEach, jest */
import { createInnerTRPCContext } from "~/server/api/trpc";
import { appRouter } from "~/server/api/root";
import { db } from "~/server/db";

// Mock Stripe
jest.mock("~/utils/stripe", () => ({
  stripe: {},
  createStripeCustomer: jest.fn().mockResolvedValue({ id: "cus_test123" }),
  createCheckoutSession: jest.fn().mockResolvedValue({
    id: "cs_test123",
    url: "https://checkout.stripe.com/test",
  }),
  ANNUAL_SUBSCRIPTION_CONFIG: {
    mode: "subscription",
    priceId: "price_test123",
  },
}));

describe("Subscription API", () => {
  let testUserId: string;

  beforeEach(async () => {
    // Clean up any existing test data
    await db.user.deleteMany({
      where: { email: "test-subscription@example.com" },
    });

    // Create a test user
    const user = await db.user.create({
      data: {
        email: "test-subscription@example.com",
        name: "Test Subscriber",
      },
    });
    testUserId = user.id;
  });

  afterEach(async () => {
    // Clean up
    await db.subscription.deleteMany({
      where: { userId: testUserId },
    });
    await db.user.delete({
      where: { id: testUserId },
    });
  });

  describe("getSubscriptionStatus", () => {
    it("should return no subscription for new user", async () => {
      const ctx = createInnerTRPCContext({
        session: {
          user: { id: testUserId, email: "test-subscription@example.com" },
          expires: new Date(Date.now() + 86400000).toISOString(),
        },
        correlationId: "test-correlation-id",
      });

      const caller = appRouter.createCaller(ctx);
      const result = await caller.subscription.getSubscriptionStatus();

      expect(result).toEqual({
        hasSubscription: false,
        status: "none",
      });
    });

    it("should return active subscription status", async () => {
      // Create an active subscription
      await db.subscription.create({
        data: {
          userId: testUserId,
          stripeCustomerId: "cus_test123",
          stripePriceId: "price_test123",
          status: "active",
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        },
      });

      const ctx = createInnerTRPCContext({
        session: {
          user: { id: testUserId, email: "test-subscription@example.com" },
          expires: new Date(Date.now() + 86400000).toISOString(),
        },
        correlationId: "test-correlation-id",
      });

      const caller = appRouter.createCaller(ctx);
      const result = await caller.subscription.getSubscriptionStatus();

      expect(result.hasSubscription).toBe(true);
      expect(result.status).toBe("active");
      expect(result.currentPeriodEnd).toBeDefined();
      expect(result.cancelAtPeriodEnd).toBe(false);
    });
  });

  describe("createCheckoutSession", () => {
    it("should create a checkout session for new subscription", async () => {
      const ctx = createInnerTRPCContext({
        session: {
          user: { 
            id: testUserId, 
            email: "test-subscription@example.com",
            name: "Test Subscriber"
          },
          expires: new Date(Date.now() + 86400000).toISOString(),
        },
        correlationId: "test-correlation-id",
        req: {
          headers: {
            host: "localhost:3000",
          },
        } as any,
        res: {} as any,
      });

      const caller = appRouter.createCaller(ctx);
      const result = await caller.subscription.createCheckoutSession({});

      expect(result).toEqual({
        url: "https://checkout.stripe.com/test",
        sessionId: "cs_test123",
      });

      // Verify subscription record was created
      const subscription = await db.subscription.findUnique({
        where: { userId: testUserId },
      });

      expect(subscription).toBeDefined();
      expect(subscription?.stripeCustomerId).toBe("cus_test123");
      expect(subscription?.status).toBe("inactive");
    });

    it("should reject if user already has active subscription", async () => {
      // Create an active subscription
      await db.subscription.create({
        data: {
          userId: testUserId,
          stripeCustomerId: "cus_test123",
          stripePriceId: "price_test123",
          status: "active",
        },
      });

      const ctx = createInnerTRPCContext({
        session: {
          user: { 
            id: testUserId, 
            email: "test-subscription@example.com",
            name: "Test Subscriber"
          },
          expires: new Date(Date.now() + 86400000).toISOString(),
        },
        correlationId: "test-correlation-id",
        req: {
          headers: {
            host: "localhost:3000",
          },
        } as any,
        res: {} as any,
      });

      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.subscription.createCheckoutSession({})
      ).rejects.toThrow("You already have an active subscription");
    });
  });
});