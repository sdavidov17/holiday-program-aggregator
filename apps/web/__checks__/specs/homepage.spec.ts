import { expect, test } from '@playwright/test';

const baseUrl = process.env.ENVIRONMENT_URL || 'https://holiday-heroes-five.vercel.app';

test('Homepage loads successfully', async ({ page }) => {
  // Navigate to homepage
  const response = await page.goto(baseUrl, { waitUntil: 'domcontentloaded' });

  // Verify response status
  expect(response?.status()).toBeLessThan(400);

  // Verify critical elements are visible
  await expect(page.locator('h1')).toBeVisible({ timeout: 10000 });
  await expect(page.locator('[data-testid="hero-cta"]')).toBeVisible();

  // Verify page title
  await expect(page).toHaveTitle(/HolidayHeroes/i);
});
