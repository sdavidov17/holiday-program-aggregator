import { expect, test } from '@playwright/test';

const baseUrl = process.env.ENVIRONMENT_URL || 'https://holiday-heroes-five.vercel.app';

test('Registration form is accessible and functional', async ({ page }) => {
  // Navigate to sign in page
  await page.goto(`${baseUrl}/auth/signin`, { waitUntil: 'domcontentloaded' });

  // Toggle to registration mode
  await page.click('[data-testid="toggle-auth-mode"]');

  // Verify registration form elements are visible
  await expect(page.locator('[data-testid="name-input"]')).toBeVisible({ timeout: 10000 });
  await expect(page.locator('[data-testid="email-input"]')).toBeVisible();
  await expect(page.locator('[data-testid="password-input"]')).toBeVisible();
  await expect(page.locator('[data-testid="confirm-password-input"]')).toBeVisible();
  await expect(page.locator('[data-testid="signup-button"]')).toBeVisible();

  // Verify form is interactive
  await page.fill('[data-testid="name-input"]', 'Test User');
  await page.fill('[data-testid="email-input"]', 'test@example.com');
  await expect(page.locator('[data-testid="name-input"]')).toHaveValue('Test User');
  await expect(page.locator('[data-testid="email-input"]')).toHaveValue('test@example.com');
});
