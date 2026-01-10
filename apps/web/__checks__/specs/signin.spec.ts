import { expect, test } from '@playwright/test';

const baseUrl = process.env.ENVIRONMENT_URL || 'https://holiday-heroes-five.vercel.app';

test('Sign in page loads and form is functional', async ({ page }) => {
  // Navigate to sign in page
  const response = await page.goto(`${baseUrl}/auth/signin`, { waitUntil: 'domcontentloaded' });

  // Verify response status
  expect(response?.status()).toBeLessThan(400);

  // Verify sign in form elements are visible
  await expect(page.locator('h1')).toContainText(/Welcome/i, { timeout: 10000 });
  await expect(page.locator('input[type="email"], [data-testid="email-input"]')).toBeVisible();
  await expect(
    page.locator('input[type="password"], [data-testid="password-input"]'),
  ).toBeVisible();
  await expect(page.locator('button[type="submit"], [data-testid="signin-button"]')).toBeVisible();

  // Verify Google OAuth button is visible
  await expect(
    page.locator('button:has-text("Google"), [data-testid="google-signin"]'),
  ).toBeVisible();

  // Verify form is interactive (can type in fields)
  await page.fill('input[type="email"], [data-testid="email-input"]', 'test@example.com');
  await expect(page.locator('input[type="email"], [data-testid="email-input"]')).toHaveValue(
    'test@example.com',
  );
});
