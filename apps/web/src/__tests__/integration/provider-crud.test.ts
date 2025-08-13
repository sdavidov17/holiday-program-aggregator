/**
 * Integration tests for Provider CRUD operations
 * Epic 1, Story 5: Manual Provider Onboarding Tool
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { createMockContext } from '../helpers/test-context';
import { providerRouter } from '~/server/api/routers/provider';
import { TRPCError } from '@trpc/server';
import { db } from '~/server/db';

describe('Provider CRUD Operations', () => {
  let adminContext: any;
  let userContext: any;
  let testProviderId: string;

  beforeEach(async () => {
    // Create mock contexts
    adminContext = createMockContext({
      session: {
        user: {
          id: 'admin-1',
          email: 'admin@test.com',
          role: 'ADMIN',
        },
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      },
    });

    userContext = createMockContext({
      session: {
        user: {
          id: 'user-1',
          email: 'user@test.com',
          role: 'USER',
        },
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      },
    });

    // Clean up test providers
    await db.provider.deleteMany({
      where: {
        email: {
          startsWith: 'test-provider',
        },
      },
    });
  });

  afterEach(async () => {
    // Clean up created test data
    if (testProviderId) {
      await db.provider.delete({
        where: { id: testProviderId },
      }).catch(() => {});
    }
  });

  describe('create', () => {
    it('should allow admin to create a provider', async () => {
      const providerData = {
        businessName: 'Test Provider Ltd',
        contactName: 'John Doe',
        email: 'test-provider@example.com',
        phone: '0400000000',
        website: 'https://testprovider.com',
        abn: '12345678901',
        address: '123 Test Street',
        suburb: 'Sydney',
        state: 'NSW',
        postcode: '2000',
        description: 'A test provider for holiday programs',
        logoUrl: 'https://example.com/logo.png',
        capacity: 50,
        ageGroups: ['5-7', '8-12'],
        specialNeeds: true,
        specialNeedsDetails: 'Wheelchair accessible',
        isVetted: false,
        isPublished: false,
      };

      const result = await providerRouter
        .createCaller(adminContext)
        .create(providerData);

      expect(result).toMatchObject({
        businessName: providerData.businessName,
        email: providerData.email,
        isVetted: false,
        isPublished: false,
      });
      expect(result.id).toBeDefined();
      testProviderId = result.id;
    });

    it('should reject non-admin users from creating providers', async () => {
      const providerData = {
        businessName: 'Test Provider Ltd',
        contactName: 'John Doe',
        email: 'test-provider-2@example.com',
        phone: '0400000000',
        address: '123 Test Street',
        suburb: 'Sydney',
        state: 'NSW',
        postcode: '2000',
        description: 'A test provider',
      };

      await expect(
        providerRouter.createCaller(userContext).create(providerData)
      ).rejects.toThrow(TRPCError);
    });

    it('should validate required fields', async () => {
      const invalidData = {
        businessName: '',
        contactName: '',
        email: 'invalid-email',
        phone: '',
        address: '',
        suburb: '',
        state: '',
        postcode: '',
        description: '',
      };

      await expect(
        providerRouter.createCaller(adminContext).create(invalidData)
      ).rejects.toThrow();
    });
  });

  describe('update', () => {
    beforeEach(async () => {
      // Create a test provider
      const provider = await db.provider.create({
        data: {
          businessName: 'Update Test Provider',
          contactName: 'Jane Doe',
          email: 'test-provider-update@example.com',
          phone: '0411111111',
          address: '456 Update Street',
          suburb: 'Melbourne',
          state: 'VIC',
          postcode: '3000',
          description: 'Provider to be updated',
        },
      });
      testProviderId = provider.id;
    });

    it('should allow admin to update a provider', async () => {
      const updateData = {
        id: testProviderId,
        businessName: 'Updated Provider Name',
        isVetted: true,
        isPublished: true,
      };

      const result = await providerRouter
        .createCaller(adminContext)
        .update(updateData);

      expect(result.businessName).toBe('Updated Provider Name');
      expect(result.isVetted).toBe(true);
      expect(result.isPublished).toBe(true);
    });

    it('should reject non-admin users from updating providers', async () => {
      await expect(
        providerRouter.createCaller(userContext).update({
          id: testProviderId,
          businessName: 'Hacked Name',
        })
      ).rejects.toThrow(TRPCError);
    });
  });

  describe('toggleVetting', () => {
    beforeEach(async () => {
      const provider = await db.provider.create({
        data: {
          businessName: 'Vetting Test Provider',
          contactName: 'Test Contact',
          email: 'test-provider-vetting@example.com',
          phone: '0422222222',
          address: '789 Vetting Street',
          suburb: 'Brisbane',
          state: 'QLD',
          postcode: '4000',
          description: 'Provider for vetting test',
          isVetted: false,
        },
      });
      testProviderId = provider.id;
    });

    it('should toggle vetting status', async () => {
      // Toggle to vetted
      let result = await providerRouter
        .createCaller(adminContext)
        .toggleVetting({ id: testProviderId });

      expect(result.isVetted).toBe(true);
      expect(result.vettingDate).toBeDefined();
      expect(result.vettingStatus).toBe('APPROVED');

      // Toggle back to unvetted
      result = await providerRouter
        .createCaller(adminContext)
        .toggleVetting({ id: testProviderId });

      expect(result.isVetted).toBe(false);
      expect(result.vettingStatus).toBe('NOT_STARTED');
    });
  });

  describe('togglePublishing', () => {
    beforeEach(async () => {
      const provider = await db.provider.create({
        data: {
          businessName: 'Publishing Test Provider',
          contactName: 'Test Contact',
          email: 'test-provider-publishing@example.com',
          phone: '0433333333',
          address: '321 Publishing Street',
          suburb: 'Perth',
          state: 'WA',
          postcode: '6000',
          description: 'Provider for publishing test',
          isVetted: true,  // Provider must be vetted before publishing
          isPublished: false,
        },
      });
      testProviderId = provider.id;
    });

    it('should toggle publishing status', async () => {
      // Toggle to published
      let result = await providerRouter
        .createCaller(adminContext)
        .togglePublishing({ id: testProviderId });

      expect(result.isPublished).toBe(true);

      // Toggle back to unpublished
      result = await providerRouter
        .createCaller(adminContext)
        .togglePublishing({ id: testProviderId });

      expect(result.isPublished).toBe(false);
    });
  });

  describe('getAll', () => {
    beforeEach(async () => {
      // Create multiple test providers
      await db.provider.createMany({
        data: [
          {
            businessName: 'Published Vetted Provider',
            contactName: 'Contact 1',
            email: 'test-provider-pv@example.com',
            phone: '0444444444',
            address: '111 Test St',
            suburb: 'Sydney',
            state: 'NSW',
            postcode: '2000',
            description: 'Published and vetted',
            isPublished: true,
            isVetted: true,
          },
          {
            businessName: 'Unpublished Provider',
            contactName: 'Contact 2',
            email: 'test-provider-up@example.com',
            phone: '0455555555',
            address: '222 Test St',
            suburb: 'Sydney',
            state: 'NSW',
            postcode: '2000',
            description: 'Not published',
            isPublished: false,
            isVetted: true,
          },
          {
            businessName: 'Unvetted Provider',
            contactName: 'Contact 3',
            email: 'test-provider-uv@example.com',
            phone: '0466666666',
            address: '333 Test St',
            suburb: 'Sydney',
            state: 'NSW',
            postcode: '2000',
            description: 'Not vetted',
            isPublished: true,
            isVetted: false,
          },
        ],
      });
    });

    it('should return all providers for admin with filters', async () => {
      // Get all providers
      const allProviders = await providerRouter
        .createCaller(adminContext)
        .getAll({
          includeUnpublished: true,
          includeUnvetted: true,
        });

      expect(allProviders.length).toBeGreaterThanOrEqual(3);

      // Get only published and vetted
      const publishedVetted = await providerRouter
        .createCaller(adminContext)
        .getAll({
          includeUnpublished: false,
          includeUnvetted: false,
        });

      const filteredProviders = publishedVetted.filter(p => 
        p.email?.startsWith('test-provider')
      );
      expect(filteredProviders.length).toBe(1);
      expect(filteredProviders[0]?.businessName).toBe('Published Vetted Provider');
    });

    it('should reject non-admin users from accessing getAll', async () => {
      await expect(
        providerRouter.createCaller(userContext).getAll()
      ).rejects.toThrow(TRPCError);
    });
  });

  describe('getPublished', () => {
    it('should return only published and vetted providers for users', async () => {
      const publishedProviders = await providerRouter
        .createCaller(userContext)
        .getPublished();

      // Should only return providers that are both published AND vetted
      publishedProviders.forEach(provider => {
        expect(provider.isPublished).toBe(true);
        expect(provider.isVetted).toBe(true);
      });
    });
  });

  describe('delete', () => {
    beforeEach(async () => {
      const provider = await db.provider.create({
        data: {
          businessName: 'Provider to Delete',
          contactName: 'Delete Me',
          email: 'test-provider-delete@example.com',
          phone: '0477777777',
          address: '999 Delete Street',
          suburb: 'Adelaide',
          state: 'SA',
          postcode: '5000',
          description: 'This provider will be deleted',
        },
      });
      testProviderId = provider.id;
    });

    it('should allow admin to delete a provider', async () => {
      await providerRouter
        .createCaller(adminContext)
        .delete({ id: testProviderId });

      // Verify provider is deleted
      const deletedProvider = await db.provider.findUnique({
        where: { id: testProviderId },
      });

      expect(deletedProvider).toBeNull();
      testProviderId = ''; // Clear so afterEach doesn't try to delete
    });

    it('should reject non-admin users from deleting providers', async () => {
      await expect(
        providerRouter.createCaller(userContext).delete({ id: testProviderId })
      ).rejects.toThrow(TRPCError);

      // Verify provider still exists
      const provider = await db.provider.findUnique({
        where: { id: testProviderId },
      });

      expect(provider).toBeDefined();
    });
  });
});

// Helper function to create mock context
function createMockContext(overrides?: any) {
  return {
    session: overrides?.session || null,
    db,
    req: {} as any,
    res: {} as any,
    ...overrides,
  };
}