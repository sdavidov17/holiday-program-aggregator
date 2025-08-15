/**
 * E2E tests for Provider Management Workflow
 * Epic 1, Story 5: Manual Provider Onboarding Tool
 */

import { afterAll, beforeAll, beforeEach, describe, expect, it } from '@jest/globals';
import type { Provider } from '@prisma/client';
import { providerRouter } from '~/server/api/routers/provider';
import { db } from '~/server/db';
import { createMockContext } from '../helpers/test-context';

describe('E2E: Provider Management Workflow', () => {
  let adminContext: any;
  let userContext: any;
  let testProviders: Provider[] = [];

  beforeAll(async () => {
    // Setup contexts
    adminContext = createMockContext({
      session: {
        user: {
          id: 'admin-e2e',
          email: 'admin.e2e@test.com',
          role: 'ADMIN',
        },
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      },
    });

    userContext = createMockContext({
      session: {
        user: {
          id: 'user-e2e',
          email: 'user.e2e@test.com',
          role: 'USER',
        },
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      },
    });
  });

  beforeEach(async () => {
    // Clean up test data
    await db.provider.deleteMany({
      where: {
        OR: [{ email: { contains: 'e2e-test' } }, { businessName: { contains: 'E2E Test' } }],
      },
    });
    testProviders = [];
  });

  afterAll(async () => {
    // Final cleanup
    await db.provider.deleteMany({
      where: {
        OR: [{ email: { contains: 'e2e-test' } }, { businessName: { contains: 'E2E Test' } }],
      },
    });
  });

  describe('Complete Provider Lifecycle', () => {
    it('should handle complete provider lifecycle from creation to deletion', async () => {
      // Step 1: Create a new provider as admin
      const createData = {
        businessName: 'E2E Test Holiday Camp',
        contactName: 'Jane Smith',
        email: 'e2e-test-camp@example.com',
        phone: '0412345678',
        website: 'https://e2e-test-camp.com',
        abn: '98765432109',
        address: '456 E2E Street',
        suburb: 'Brisbane',
        state: 'QLD',
        postcode: '4000',
        description: 'E2E test provider for holiday programs',
        logoUrl: 'https://example.com/e2e-logo.png',
        capacity: 100,
        ageGroups: ['5-7', '8-10', '11-13'],
        specialNeeds: true,
        specialNeedsDetails: 'Full accessibility support',
        isVetted: false,
        isPublished: false,
      };

      const createdProvider = await providerRouter.createCaller(adminContext).create(createData);

      expect(createdProvider).toMatchObject({
        businessName: createData.businessName,
        email: createData.email,
        isVetted: false,
        isPublished: false,
        vettingStatus: 'NOT_STARTED',
      });
      expect(createdProvider.id).toBeDefined();
      testProviders.push(createdProvider);

      // Step 2: Verify the provider appears in admin list
      const adminProviders = await providerRouter
        .createCaller(adminContext)
        .getAll({ includeUnpublished: true, includeUnvetted: true });

      const foundProvider = adminProviders.find((p) => p.id === createdProvider.id);
      expect(foundProvider).toBeDefined();
      expect(foundProvider?.businessName).toBe(createData.businessName);

      // Step 3: Verify unpublished provider is NOT visible to regular users
      const userProviders = await providerRouter.createCaller(userContext).getPublished();

      const notFoundProvider = userProviders.find((p) => p.id === createdProvider.id);
      expect(notFoundProvider).toBeUndefined();

      // Step 4: Update provider details
      const updateData = {
        id: createdProvider.id,
        businessName: 'E2E Test Holiday Camp Updated',
        capacity: 150,
        website: 'https://updated-e2e-camp.com',
      };

      const updatedProvider = await providerRouter.createCaller(adminContext).update(updateData);

      expect(updatedProvider.businessName).toBe(updateData.businessName);
      expect(updatedProvider.capacity).toBe(150);
      expect(updatedProvider.website).toBe(updateData.website);

      // Step 5: Toggle vetting status
      const vettedProvider = await providerRouter
        .createCaller(adminContext)
        .toggleVetting({ id: createdProvider.id });

      expect(vettedProvider.isVetted).toBe(true);
      expect(vettedProvider.vettingStatus).toBe('APPROVED');
      expect(vettedProvider.vettingDate).toBeDefined();

      // Step 6: Toggle publishing status (should work now that provider is vetted)
      const publishedProvider = await providerRouter
        .createCaller(adminContext)
        .togglePublishing({ id: createdProvider.id });

      expect(publishedProvider.isPublished).toBe(true);

      // Step 7: Verify published and vetted provider IS visible to regular users
      const publicProviders = await providerRouter.createCaller(userContext).getPublished();

      const nowFoundProvider = publicProviders.find((p) => p.id === createdProvider.id);
      expect(nowFoundProvider).toBeDefined();
      expect(nowFoundProvider?.isVetted).toBe(true);
      expect(nowFoundProvider?.isPublished).toBe(true);

      // Step 8: Unpublish the provider
      const unpublishedProvider = await providerRouter
        .createCaller(adminContext)
        .togglePublishing({ id: createdProvider.id });

      expect(unpublishedProvider.isPublished).toBe(false);

      // Step 9: Verify unpublished provider is no longer visible to users
      const publicProvidersAfterUnpublish = await providerRouter
        .createCaller(userContext)
        .getPublished();

      const noLongerFoundProvider = publicProvidersAfterUnpublish.find(
        (p) => p.id === createdProvider.id,
      );
      expect(noLongerFoundProvider).toBeUndefined();

      // Step 10: Delete the provider
      await providerRouter.createCaller(adminContext).delete({ id: createdProvider.id });

      // Step 11: Verify provider is deleted
      const providersAfterDelete = await providerRouter
        .createCaller(adminContext)
        .getAll({ includeUnpublished: true, includeUnvetted: true });

      const deletedProvider = providersAfterDelete.find((p) => p.id === createdProvider.id);
      expect(deletedProvider).toBeUndefined();
    });
  });

  describe('Batch Operations', () => {
    it('should handle multiple providers with different states correctly', async () => {
      // Create multiple providers with different states
      const providers = await Promise.all([
        // Published and vetted provider
        providerRouter
          .createCaller(adminContext)
          .create({
            businessName: 'E2E Test Provider 1',
            contactName: 'Contact 1',
            email: 'e2e-test-1@example.com',
            phone: '0411111111',
            address: '111 Test St',
            suburb: 'Sydney',
            state: 'NSW',
            postcode: '2000',
            description: 'Published and vetted provider',
            isVetted: true,
            isPublished: true,
          }),
        // Vetted but unpublished provider
        providerRouter
          .createCaller(adminContext)
          .create({
            businessName: 'E2E Test Provider 2',
            contactName: 'Contact 2',
            email: 'e2e-test-2@example.com',
            phone: '0422222222',
            address: '222 Test St',
            suburb: 'Melbourne',
            state: 'VIC',
            postcode: '3000',
            description: 'Vetted but unpublished provider',
            isVetted: true,
            isPublished: false,
          }),
        // Unvetted and unpublished provider
        providerRouter
          .createCaller(adminContext)
          .create({
            businessName: 'E2E Test Provider 3',
            contactName: 'Contact 3',
            email: 'e2e-test-3@example.com',
            phone: '0433333333',
            address: '333 Test St',
            suburb: 'Brisbane',
            state: 'QLD',
            postcode: '4000',
            description: 'Unvetted and unpublished provider',
            isVetted: false,
            isPublished: false,
          }),
      ]);

      testProviders.push(...providers);

      // Test filtering in admin view
      const allProviders = await providerRouter
        .createCaller(adminContext)
        .getAll({ includeUnpublished: true, includeUnvetted: true });

      const e2eProviders = allProviders.filter((p) => p.businessName.includes('E2E Test Provider'));
      expect(e2eProviders).toHaveLength(3);

      // Test filtering published only
      const publishedOnly = await providerRouter
        .createCaller(adminContext)
        .getAll({ includeUnpublished: false, includeUnvetted: false });

      const e2ePublished = publishedOnly.filter((p) =>
        p.businessName.includes('E2E Test Provider'),
      );
      expect(e2ePublished).toHaveLength(1);
      expect(e2ePublished[0]?.businessName).toBe('E2E Test Provider 1');

      // Test public view (should only see published and vetted)
      const publicProviders = await providerRouter.createCaller(userContext).getPublished();

      const e2ePublic = publicProviders.filter((p) => p.businessName.includes('E2E Test Provider'));
      expect(e2ePublic).toHaveLength(1);
      expect(e2ePublic[0]?.businessName).toBe('E2E Test Provider 1');

      // Batch toggle operations
      await Promise.all([
        // Publish provider 2 (already vetted)
        providerRouter
          .createCaller(adminContext)
          .togglePublishing({ id: providers[1]!.id }),
        // Vet provider 3
        providerRouter
          .createCaller(adminContext)
          .toggleVetting({ id: providers[2]!.id }),
      ]);

      // Verify changes
      const updatedPublicProviders = await providerRouter.createCaller(userContext).getPublished();

      const e2ePublicUpdated = updatedPublicProviders.filter((p) =>
        p.businessName.includes('E2E Test Provider'),
      );
      expect(e2ePublicUpdated).toHaveLength(2); // Now providers 1 and 2 are public

      // Clean up
      await Promise.all(
        providers.map((p) => providerRouter.createCaller(adminContext).delete({ id: p.id })),
      );
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid data gracefully', async () => {
      // Try to create provider with invalid email
      await expect(
        providerRouter.createCaller(adminContext).create({
          businessName: 'Invalid Provider',
          contactName: 'Test',
          email: 'not-an-email',
          phone: '0400000000',
          address: 'Test St',
          suburb: 'Sydney',
          state: 'NSW',
          postcode: '2000',
          description: 'Test',
        }),
      ).rejects.toThrow();

      // Try to update non-existent provider
      await expect(
        providerRouter.createCaller(adminContext).update({
          id: 'non-existent-id',
          businessName: 'Updated Name',
        }),
      ).rejects.toThrow();

      // Try to delete non-existent provider
      await expect(
        providerRouter.createCaller(adminContext).delete({
          id: 'non-existent-id',
        }),
      ).rejects.toThrow();
    });

    it('should enforce authorization rules', async () => {
      // Create a provider as admin
      const provider = await providerRouter.createCaller(adminContext).create({
        businessName: 'E2E Test Auth Provider',
        contactName: 'Auth Test',
        email: 'e2e-test-auth@example.com',
        phone: '0499999999',
        address: '999 Auth St',
        suburb: 'Perth',
        state: 'WA',
        postcode: '6000',
        description: 'Authorization test provider',
      });

      testProviders.push(provider);

      // Try to update as regular user (should fail)
      await expect(
        providerRouter.createCaller(userContext).update({
          id: provider.id,
          businessName: 'Hacked Name',
        }),
      ).rejects.toThrow();

      // Try to delete as regular user (should fail)
      await expect(
        providerRouter.createCaller(userContext).delete({
          id: provider.id,
        }),
      ).rejects.toThrow();

      // Try to toggle vetting as regular user (should fail)
      await expect(
        providerRouter.createCaller(userContext).toggleVetting({
          id: provider.id,
        }),
      ).rejects.toThrow();

      // Try to toggle publishing as regular user (should fail)
      await expect(
        providerRouter.createCaller(userContext).togglePublishing({
          id: provider.id,
        }),
      ).rejects.toThrow();

      // Clean up
      await providerRouter.createCaller(adminContext).delete({ id: provider.id });
    });
  });

  describe('Data Validation', () => {
    it('should validate Australian postcodes', async () => {
      // Valid postcodes
      const validPostcodes = ['2000', '3000', '4000', '5000', '6000', '7000', '0800'];

      for (const postcode of validPostcodes) {
        const provider = await providerRouter.createCaller(adminContext).create({
          businessName: `E2E Test Postcode ${postcode}`,
          contactName: 'Test',
          email: `e2e-test-${postcode}@example.com`,
          phone: '0400000000',
          address: 'Test St',
          suburb: 'Test',
          state: 'NSW',
          postcode,
          description: 'Postcode validation test',
        });

        expect(provider.postcode).toBe(postcode);
        testProviders.push(provider);
      }

      // Invalid postcodes
      const invalidPostcodes = ['1234', '9999', 'ABCD', '12345', ''];

      for (const postcode of invalidPostcodes) {
        await expect(
          providerRouter.createCaller(adminContext).create({
            businessName: `E2E Test Invalid ${postcode}`,
            contactName: 'Test',
            email: `e2e-test-invalid-${postcode}@example.com`,
            phone: '0400000000',
            address: 'Test St',
            suburb: 'Test',
            state: 'NSW',
            postcode,
            description: 'Invalid postcode test',
          }),
        ).rejects.toThrow();
      }
    });

    it('should handle special characters in provider names', async () => {
      const specialNameProvider = await providerRouter.createCaller(adminContext).create({
        businessName: "O'Brien's Holiday Camp & Co.",
        contactName: "John O'Brien",
        email: 'e2e-test-special@example.com',
        phone: '0488888888',
        address: '888 Special St',
        suburb: 'Darwin',
        state: 'NT',
        postcode: '0800',
        description: 'Provider with special characters in name',
      });

      expect(specialNameProvider.businessName).toBe("O'Brien's Holiday Camp & Co.");
      testProviders.push(specialNameProvider);

      // Verify it can be retrieved correctly
      const retrieved = await providerRouter
        .createCaller(adminContext)
        .getById({ id: specialNameProvider.id });

      expect(retrieved.businessName).toBe("O'Brien's Holiday Camp & Co.");
    });
  });
});
