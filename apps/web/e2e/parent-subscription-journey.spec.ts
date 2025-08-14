/**
 * Parent Subscription Journey E2E Test
 * Complete end-to-end test for parent user journey from landing to subscription
 */

import { test, expect, Page } from '@playwright/test';
import { faker } from '@faker-js/faker';

// Test data
const testUser = {
  email: faker.internet.email().toLowerCase(),
  password: 'Test123!@#',
  name: faker.person.fullName(),
};

// Helper functions
async function registerUser(page: Page, user: typeof testUser) {
  await page.goto('/auth/signup');
  await page.fill('[data-testid="name-input"]', user.name);
  await page.fill('[data-testid="email-input"]', user.email);
  await page.fill('[data-testid="password-input"]', user.password);
  await page.fill('[data-testid="confirm-password-input"]', user.password);
  await page.click('[data-testid="signup-button"]');
}

async function loginUser(page: Page, user: typeof testUser) {
  await page.goto('/auth/signin');
  await page.fill('[data-testid="email-input"]', user.email);
  await page.fill('[data-testid="password-input"]', user.password);
  await page.click('[data-testid="signin-button"]');
}

test.describe('Parent Subscription Journey', () => {
  test.beforeEach(async ({ page }) => {
    // Set viewport for consistent testing
    await page.setViewportSize({ width: 1280, height: 720 });
  });

  test('Complete parent journey: landing → registration → subscription → search → provider view', async ({ page }) => {
    // Step 1: Landing Page
    await test.step('Visit landing page', async () => {
      await page.goto('/');
      await expect(page).toHaveTitle(/Holiday Heroes/);
      await expect(page.locator('h1')).toContainText(/Find/i);
      await expect(page.locator('[data-testid="hero-cta"]')).toBeVisible();
    });

    // Step 2: Explore without registration
    await test.step('Search without registration', async () => {
      await page.fill('[data-testid="search-activity"]', 'sports');
      await page.fill('[data-testid="search-location"]', 'Sydney');
      await page.click('[data-testid="search-button"]');
      
      // Should redirect to search results
      await expect(page).toHaveURL(/\/search/);
      await expect(page.locator('[data-testid="provider-card"]')).toHaveCount(0); // No results for unauthenticated
      await expect(page.locator('[data-testid="signup-prompt"]')).toBeVisible();
    });

    // Step 3: Registration
    await test.step('Register new account', async () => {
      await page.click('[data-testid="signup-link"]');
      await expect(page).toHaveURL('/auth/signup');
      
      await registerUser(page, testUser);
      
      // Should redirect to onboarding or dashboard
      await expect(page).toHaveURL(/\/(dashboard|onboarding)/);
      await expect(page.locator('[data-testid="welcome-message"]')).toContainText(testUser.name);
    });

    // Step 4: Subscription Selection
    await test.step('Select subscription plan', async () => {
      await page.goto('/subscription/plans');
      await expect(page.locator('[data-testid="plan-card"]')).toHaveCount(3); // Basic, Essential, Premium
      
      // View plan details
      await page.click('[data-testid="plan-essential"]');
      await expect(page.locator('[data-testid="plan-features"]')).toBeVisible();
      
      // Click subscribe
      await page.click('[data-testid="subscribe-essential"]');
      
      // Should redirect to Stripe checkout (mocked in test environment)
      await expect(page).toHaveURL(/checkout/);
    });

    // Step 5: Complete Payment (Mocked)
    await test.step('Complete payment', async () => {
      // In test environment, we mock Stripe
      await page.fill('[data-testid="card-number"]', '4242424242424242');
      await page.fill('[data-testid="card-expiry"]', '12/25');
      await page.fill('[data-testid="card-cvc"]', '123');
      await page.click('[data-testid="pay-button"]');
      
      // Wait for success redirect
      await page.waitForURL(/subscription\/success/);
      await expect(page.locator('[data-testid="success-message"]')).toContainText(/subscription is now active/i);
    });

    // Step 6: Search for Providers
    await test.step('Search for providers', async () => {
      await page.goto('/search');
      
      // Apply filters
      await page.selectOption('[data-testid="age-filter"]', '5-7');
      await page.click('[data-testid="activity-sports"]');
      await page.fill('[data-testid="location-filter"]', 'Sydney NSW');
      await page.click('[data-testid="apply-filters"]');
      
      // Verify results
      await expect(page.locator('[data-testid="provider-card"]').first()).toBeVisible();
      await expect(page.locator('[data-testid="results-count"]')).toContainText(/\d+ providers found/);
    });

    // Step 7: View Provider Details
    await test.step('View provider details', async () => {
      await page.click('[data-testid="provider-card"]', { hasText: /Holiday Program/ });
      
      await expect(page).toHaveURL(/\/providers\/\w+/);
      await expect(page.locator('[data-testid="provider-name"]')).toBeVisible();
      await expect(page.locator('[data-testid="provider-description"]')).toBeVisible();
      await expect(page.locator('[data-testid="program-list"]')).toBeVisible();
      await expect(page.locator('[data-testid="contact-button"]')).toBeVisible();
    });

    // Step 8: Save Provider
    await test.step('Save provider to favorites', async () => {
      await page.click('[data-testid="save-provider"]');
      await expect(page.locator('[data-testid="saved-indicator"]')).toBeVisible();
      
      // Navigate to saved providers
      await page.goto('/dashboard/saved');
      await expect(page.locator('[data-testid="saved-provider"]')).toHaveCount(1);
    });
  });

  test('Subscription upgrade flow', async ({ page }) => {
    // Login with existing basic user
    await loginUser(page, { ...testUser, email: 'basic@test.com' });
    
    await test.step('Navigate to account settings', async () => {
      await page.goto('/account/subscription');
      await expect(page.locator('[data-testid="current-plan"]')).toContainText('Basic');
    });

    await test.step('Upgrade to Premium', async () => {
      await page.click('[data-testid="upgrade-plan"]');
      await expect(page).toHaveURL('/subscription/upgrade');
      
      await page.click('[data-testid="select-premium"]');
      await page.click('[data-testid="confirm-upgrade"]');
      
      // Mock payment confirmation
      await page.waitForURL(/account\/subscription/);
      await expect(page.locator('[data-testid="current-plan"]')).toContainText('Premium');
    });
  });

  test('Subscription cancellation flow', async ({ page }) => {
    await loginUser(page, { ...testUser, email: 'premium@test.com' });
    
    await test.step('Navigate to subscription management', async () => {
      await page.goto('/account/subscription');
      await expect(page.locator('[data-testid="cancel-subscription"]')).toBeVisible();
    });

    await test.step('Cancel subscription', async () => {
      await page.click('[data-testid="cancel-subscription"]');
      
      // Confirmation dialog
      await expect(page.locator('[data-testid="cancel-dialog"]')).toBeVisible();
      await page.selectOption('[data-testid="cancel-reason"]', 'too-expensive');
      await page.fill('[data-testid="cancel-feedback"]', 'Testing cancellation');
      await page.click('[data-testid="confirm-cancel"]');
      
      // Verify cancellation
      await expect(page.locator('[data-testid="subscription-status"]')).toContainText(/cancel at period end/i);
    });

    await test.step('Reactivate subscription', async () => {
      await page.click('[data-testid="reactivate-subscription"]');
      await expect(page.locator('[data-testid="subscription-status"]')).toContainText('Active');
    });
  });

  test('Search and filter performance', async ({ page }) => {
    await loginUser(page, testUser);
    
    await test.step('Measure search performance', async () => {
      await page.goto('/search');
      
      const startTime = Date.now();
      await page.fill('[data-testid="search-input"]', 'sports programs sydney');
      await page.click('[data-testid="search-submit"]');
      
      // Wait for results
      await page.waitForSelector('[data-testid="provider-card"]');
      const loadTime = Date.now() - startTime;
      
      expect(loadTime).toBeLessThan(3000); // 3 second max
      await expect(page.locator('[data-testid="provider-card"]')).toHaveCount.greaterThan(0);
    });
  });

  test('Mobile responsive journey', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await test.step('Navigate mobile menu', async () => {
      await page.goto('/');
      await page.click('[data-testid="mobile-menu-toggle"]');
      await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible();
    });

    await test.step('Mobile search experience', async () => {
      await page.click('[data-testid="mobile-search"]');
      await page.fill('[data-testid="search-input"]', 'holiday programs');
      await page.click('[data-testid="search-submit"]');
      
      // Verify mobile-optimized results
      await expect(page.locator('[data-testid="mobile-provider-card"]')).toBeVisible();
    });
  });

  test('Error recovery scenarios', async ({ page }) => {
    await test.step('Handle network error during payment', async () => {
      await page.goto('/subscription/plans');
      await page.click('[data-testid="subscribe-essential"]');
      
      // Simulate network error
      await page.route('**/api/stripe/**', route => route.abort());
      
      await page.fill('[data-testid="card-number"]', '4242424242424242');
      await page.click('[data-testid="pay-button"]');
      
      await expect(page.locator('[data-testid="error-message"]')).toContainText(/payment failed/i);
      await expect(page.locator('[data-testid="retry-button"]')).toBeVisible();
    });

    await test.step('Session timeout handling', async () => {
      // Simulate expired session
      await page.evaluate(() => {
        localStorage.clear();
        sessionStorage.clear();
      });
      
      await page.goto('/dashboard');
      await expect(page).toHaveURL('/auth/signin');
      await expect(page.locator('[data-testid="session-expired"]')).toBeVisible();
    });
  });

  test('Accessibility compliance', async ({ page }) => {
    await page.goto('/');
    
    await test.step('Keyboard navigation', async () => {
      // Tab through interactive elements
      await page.keyboard.press('Tab');
      await expect(page.locator(':focus')).toBeVisible();
      
      // Navigate to search
      for (let i = 0; i < 5; i++) {
        await page.keyboard.press('Tab');
      }
      await expect(page.locator('[data-testid="search-input"]:focus')).toBeVisible();
      
      // Submit with Enter
      await page.keyboard.type('sports');
      await page.keyboard.press('Enter');
    });

    await test.step('Screen reader labels', async () => {
      const searchInput = page.locator('[data-testid="search-input"]');
      await expect(searchInput).toHaveAttribute('aria-label', /search.*activities/i);
      
      const submitButton = page.locator('[data-testid="search-button"]');
      await expect(submitButton).toHaveAttribute('aria-label', /search/i);
    });
  });
});