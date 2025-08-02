// Jest globals are available without import
/* global describe, it, expect, beforeAll, afterAll */
import { db } from "~/server/db";
import { appRouter } from "~/server/api/root";
import { createInnerTRPCContext } from "~/server/api/trpc";
import { encryptPII } from "~/utils/encryption";

describe("User PII Protection", () => {
  let testUserId: string;

  beforeAll(async () => {
    // Create a test user with encrypted PII
    const user = await db.user.create({
      data: {
        email: "test-pii@example.com",
        name: "Test User",
        phoneNumber: encryptPII("+61412345678"),
        dateOfBirth: encryptPII("1990-01-01"),
        address: encryptPII("123 Test St, Sydney NSW 2000"),
      },
    });
    testUserId = user.id;
  });

  afterAll(async () => {
    // Clean up test user
    await db.user.delete({
      where: { id: testUserId },
    });
  });

  it("should not expose encrypted PII fields in API responses", async () => {
    // Create context with authenticated session
    const ctx = createInnerTRPCContext({
      session: {
        user: { id: testUserId, email: "test-pii@example.com" },
        expires: new Date(Date.now() + 86400000).toISOString(),
      },
      correlationId: "test-correlation-id",
    });

    const caller = appRouter.createCaller(ctx);

    // Update profile with new data
    const result = await caller.user.updateProfile({
      name: "Updated Name",
      phoneNumber: "+61498765432",
      dateOfBirth: "1991-02-02",
      address: "456 New St, Melbourne VIC 3000",
    });

    // Verify response does not contain PII fields
    expect(result).toHaveProperty("id");
    expect(result).toHaveProperty("name", "Updated Name");
    expect(result).toHaveProperty("email");
    expect(result).not.toHaveProperty("phoneNumber");
    expect(result).not.toHaveProperty("dateOfBirth");
    expect(result).not.toHaveProperty("address");
    expect(result).not.toHaveProperty("password");
  });

  it("should encrypt PII data before storing in database", async () => {
    // Query the database directly to verify encryption
    const user = await db.user.findUnique({
      where: { id: testUserId },
    });

    expect(user).toBeTruthy();
    
    // Verify PII fields are encrypted (not plain text)
    if (user?.phoneNumber) {
      expect(user.phoneNumber).not.toContain("+614");
      expect(user.phoneNumber.length).toBeGreaterThan(20); // Encrypted strings are longer
    }
    
    if (user?.dateOfBirth) {
      expect(user.dateOfBirth).not.toContain("1991");
      expect(user.dateOfBirth.length).toBeGreaterThan(20);
    }
    
    if (user?.address) {
      expect(user.address).not.toContain("456 New St");
      expect(user.address.length).toBeGreaterThan(20);
    }
  });
});