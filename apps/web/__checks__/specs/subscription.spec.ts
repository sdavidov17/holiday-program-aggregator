import { expect, test } from '@playwright/test';

const baseUrl = process.env.ENVIRONMENT_URL || 'https://holiday-heroes-five.vercel.app';

test('Subscription plans page is accessible', async ({ page }) => {
  // Navigate to subscription plans page
  const response = await page.goto(`${baseUrl}/subscription/plans`, {
    waitUntil: 'domcontentloaded',
  });

  // Verify response status (may redirect to signin if auth required)
  expect(response?.status()).toBeLessThan(400);

  // Check if redirected to signin (expected for unauthenticated users)
  const currentUrl = page.url();
  if (currentUrl.includes('/auth/signin')) {
    // Verify signin page loads correctly
    await expect(page.locator('h1')).toContainText(/Welcome/i, { timeout: 10000 });
  } else {
    // Verify subscription plans page has a heading
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 10000 });
  }
});
