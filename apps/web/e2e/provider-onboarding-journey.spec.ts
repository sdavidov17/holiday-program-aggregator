/**
 * Provider Onboarding Journey E2E Test
 * Complete end-to-end test for provider onboarding and management
 */

import { faker } from '@faker-js/faker';
import { expect, test } from '@playwright/test';

const testProvider = {
  businessName: faker.company.name(),
  contactName: faker.person.fullName(),
  email: faker.internet.email().toLowerCase(),
  phone: '0400000000',
  abn: '12345678901',
  website: faker.internet.url(),
  address: faker.location.streetAddress(),
  suburb: 'Sydney',
  state: 'NSW',
  postcode: '2000',
  description: faker.company.catchPhrase(),
};

const testProgram = {
  name: 'Summer Sports Camp',
  description: 'Fun sports activities for kids during summer holidays',
  category: 'Sports',
  ageMin: 5,
  ageMax: 12,
  price: 250,
  location: 'Sydney Olympic Park',
  capacity: 30,
};

test.describe('Provider Onboarding Journey', () => {
  test('Complete provider onboarding: application → vetting → profile setup → program creation', async ({
    page,
  }) => {
    // Step 1: Provider Application
    await test.step('Submit provider application', async () => {
      await page.goto('/providers/apply');
      await expect(page.locator('h1')).toContainText(/Become a Provider/i);

      // Fill business information
      await page.fill('[data-testid="business-name"]', testProvider.businessName);
      await page.fill('[data-testid="contact-name"]', testProvider.contactName);
      await page.fill('[data-testid="email"]', testProvider.email);
      await page.fill('[data-testid="phone"]', testProvider.phone);
      await page.fill('[data-testid="abn"]', testProvider.abn);
      await page.fill('[data-testid="website"]', testProvider.website);

      // Fill address
      await page.fill('[data-testid="address"]', testProvider.address);
      await page.fill('[data-testid="suburb"]', testProvider.suburb);
      await page.selectOption('[data-testid="state"]', testProvider.state);
      await page.fill('[data-testid="postcode"]', testProvider.postcode);

      // Fill description
      await page.fill('[data-testid="description"]', testProvider.description);

      // Upload documents (mocked)
      await page.setInputFiles('[data-testid="insurance-doc"]', 'test-files/insurance.pdf');
      await page.setInputFiles('[data-testid="wwcc-doc"]', 'test-files/wwcc.pdf');

      // Accept terms
      await page.check('[data-testid="terms-checkbox"]');

      // Submit application
      await page.click('[data-testid="submit-application"]');

      // Verify submission success
      await expect(page).toHaveURL('/providers/application-success');
      await expect(page.locator('[data-testid="success-message"]')).toContainText(
        /application.*received/i,
      );
    });

    // Step 2: Admin Vetting (simulated)
    await test.step('Admin approves provider', async () => {
      // Switch to admin context
      await page.goto('/admin/providers/pending');

      // Login as admin
      await page.fill('[data-testid="email-input"]', 'admin@test.com');
      await page.fill('[data-testid="password-input"]', 'AdminTest123!');
      await page.click('[data-testid="signin-button"]');

      // Find and review provider application
      await page.click(`[data-testid="provider-row"]:has-text("${testProvider.businessName}")`);

      // Review details
      await expect(page.locator('[data-testid="provider-details"]')).toBeVisible();
      await expect(page.locator('[data-testid="abn-verified"]')).toHaveText('✓ Verified');
      await expect(page.locator('[data-testid="insurance-status"]')).toHaveText('Valid');
      await expect(page.locator('[data-testid="wwcc-status"]')).toHaveText('Valid');

      // Approve provider
      await page.click('[data-testid="approve-provider"]');
      await page.fill('[data-testid="approval-notes"]', 'All checks passed');
      await page.click('[data-testid="confirm-approval"]');

      await expect(page.locator('[data-testid="status-badge"]')).toHaveText('Approved');
    });

    // Step 3: Provider Profile Setup
    await test.step('Provider completes profile', async () => {
      // Provider receives email and logs in
      await page.goto('/providers/login');
      await page.fill('[data-testid="email-input"]', testProvider.email);
      await page.fill('[data-testid="password-input"]', 'ProviderTest123!');
      await page.click('[data-testid="signin-button"]');

      // Redirect to profile setup
      await expect(page).toHaveURL('/providers/profile/setup');

      // Add logo
      await page.setInputFiles('[data-testid="logo-upload"]', 'test-files/logo.png');

      // Add operating hours
      await page.click('[data-testid="monday-checkbox"]');
      await page.fill('[data-testid="monday-open"]', '08:00');
      await page.fill('[data-testid="monday-close"]', '18:00');

      // Add special needs support
      await page.check('[data-testid="special-needs-support"]');
      await page.fill(
        '[data-testid="special-needs-details"]',
        'Wheelchair accessible, trained staff',
      );

      // Add age groups
      await page.check('[data-testid="age-5-7"]');
      await page.check('[data-testid="age-8-12"]');

      // Save profile
      await page.click('[data-testid="save-profile"]');
      await expect(page.locator('[data-testid="profile-saved"]')).toBeVisible();
    });

    // Step 4: Create First Program
    await test.step('Create holiday program', async () => {
      await page.goto('/providers/programs/new');

      // Fill program details
      await page.fill('[data-testid="program-name"]', testProgram.name);
      await page.fill('[data-testid="program-description"]', testProgram.description);
      await page.selectOption('[data-testid="program-category"]', testProgram.category);

      // Set age range
      await page.fill('[data-testid="age-min"]', testProgram.ageMin.toString());
      await page.fill('[data-testid="age-max"]', testProgram.ageMax.toString());

      // Set pricing
      await page.fill('[data-testid="program-price"]', testProgram.price.toString());
      await page.selectOption('[data-testid="price-type"]', 'per-day');

      // Set location
      await page.fill('[data-testid="program-location"]', testProgram.location);

      // Set dates
      await page.fill('[data-testid="start-date"]', '2025-01-06');
      await page.fill('[data-testid="end-date"]', '2025-01-17');

      // Set daily schedule
      await page.fill('[data-testid="start-time"]', '09:00');
      await page.fill('[data-testid="end-time"]', '15:00');

      // Set capacity
      await page.fill('[data-testid="capacity"]', testProgram.capacity.toString());

      // Add activities
      await page.click('[data-testid="add-activity"]');
      await page.fill('[data-testid="activity-1-name"]', 'Soccer');
      await page.fill('[data-testid="activity-1-duration"]', '60');

      // Upload images
      await page.setInputFiles('[data-testid="program-images"]', [
        'test-files/program1.jpg',
        'test-files/program2.jpg',
      ]);

      // Save and publish
      await page.click('[data-testid="save-program"]');
      await page.click('[data-testid="publish-program"]');

      await expect(page.locator('[data-testid="program-published"]')).toBeVisible();
    });

    // Step 5: Manage Programs
    await test.step('View and manage programs', async () => {
      await page.goto('/providers/programs');

      // Verify program listed
      await expect(page.locator('[data-testid="program-card"]')).toHaveCount(1);
      await expect(page.locator('[data-testid="program-card"]')).toContainText(testProgram.name);

      // Edit program
      await page.click('[data-testid="edit-program"]');
      await page.fill('[data-testid="program-price"]', '275');
      await page.click('[data-testid="save-changes"]');

      await expect(page.locator('[data-testid="changes-saved"]')).toBeVisible();

      // View enrollments
      await page.click('[data-testid="view-enrollments"]');
      await expect(page.locator('[data-testid="enrollment-count"]')).toContainText('0 enrolled');
    });
  });

  test('Provider dashboard analytics', async ({ page }) => {
    // Login as existing provider
    await page.goto('/providers/login');
    await page.fill('[data-testid="email-input"]', 'provider@test.com');
    await page.fill('[data-testid="password-input"]', 'ProviderTest123!');
    await page.click('[data-testid="signin-button"]');

    await test.step('View dashboard metrics', async () => {
      await expect(page.locator('[data-testid="total-views"]')).toBeVisible();
      await expect(page.locator('[data-testid="total-inquiries"]')).toBeVisible();
      await expect(page.locator('[data-testid="total-enrollments"]')).toBeVisible();
      await expect(page.locator('[data-testid="revenue-this-month"]')).toBeVisible();
    });

    await test.step('View detailed analytics', async () => {
      await page.click('[data-testid="view-analytics"]');

      // Chart visibility
      await expect(page.locator('[data-testid="views-chart"]')).toBeVisible();
      await expect(page.locator('[data-testid="enrollment-chart"]')).toBeVisible();

      // Date range filter
      await page.selectOption('[data-testid="date-range"]', 'last-30-days');
      await expect(page.locator('[data-testid="views-chart"]')).toBeVisible();
    });
  });

  test('Program availability management', async ({ page }) => {
    await page.goto('/providers/programs/summer-camp/availability');

    await test.step('Set holiday dates', async () => {
      await page.click('[data-testid="add-holiday"]');
      await page.fill('[data-testid="holiday-date"]', '2025-01-26');
      await page.fill('[data-testid="holiday-reason"]', 'Australia Day');
      await page.click('[data-testid="save-holiday"]');

      await expect(page.locator('[data-testid="holiday-added"]')).toBeVisible();
    });

    await test.step('Manage capacity', async () => {
      // Reduce capacity for specific date
      await page.click('[data-testid="date-2025-01-10"]');
      await page.fill('[data-testid="adjusted-capacity"]', '20');
      await page.fill('[data-testid="capacity-reason"]', 'Staff training day');
      await page.click('[data-testid="save-capacity"]');

      await expect(page.locator('[data-testid="capacity-updated"]')).toBeVisible();
    });

    await test.step('Close registrations', async () => {
      await page.click('[data-testid="close-registrations"]');
      await page.fill('[data-testid="close-reason"]', 'Fully booked');
      await page.click('[data-testid="confirm-close"]');

      await expect(page.locator('[data-testid="status-badge"]')).toHaveText('Closed');
    });
  });

  test('Provider communication center', async ({ page }) => {
    await page.goto('/providers/messages');

    await test.step('View parent inquiries', async () => {
      await expect(page.locator('[data-testid="inquiry-list"]')).toBeVisible();
      await expect(page.locator('[data-testid="unread-count"]')).toContainText(/\d+/);

      // Open inquiry
      await page.click('[data-testid="inquiry-item"]').first();
      await expect(page.locator('[data-testid="inquiry-message"]')).toBeVisible();

      // Reply to inquiry
      await page.fill('[data-testid="reply-message"]', 'Thank you for your interest...');
      await page.click('[data-testid="send-reply"]');

      await expect(page.locator('[data-testid="reply-sent"]')).toBeVisible();
    });

    await test.step('Send announcement', async () => {
      await page.click('[data-testid="new-announcement"]');
      await page.fill('[data-testid="announcement-title"]', 'Early Bird Special');
      await page.fill('[data-testid="announcement-message"]', '10% off for January programs');
      await page.selectOption('[data-testid="recipient-group"]', 'all-parents');
      await page.click('[data-testid="send-announcement"]');

      await expect(page.locator('[data-testid="announcement-sent"]')).toBeVisible();
    });
  });

  test('Provider billing and payments', async ({ page }) => {
    await page.goto('/providers/billing');

    await test.step('View payment history', async () => {
      await expect(page.locator('[data-testid="payment-history"]')).toBeVisible();
      await expect(page.locator('[data-testid="payment-row"]')).toHaveCount.greaterThan(0);
    });

    await test.step('Update banking details', async () => {
      await page.click('[data-testid="update-banking"]');
      await page.fill('[data-testid="account-name"]', 'Test Provider Pty Ltd');
      await page.fill('[data-testid="bsb"]', '123-456');
      await page.fill('[data-testid="account-number"]', '12345678');
      await page.click('[data-testid="save-banking"]');

      await expect(page.locator('[data-testid="banking-updated"]')).toBeVisible();
    });

    await test.step('Download invoice', async () => {
      const [download] = await Promise.all([
        page.waitForEvent('download'),
        page.click('[data-testid="download-invoice"]').first(),
      ]);

      expect(download.suggestedFilename()).toContain('invoice');
    });
  });
});
