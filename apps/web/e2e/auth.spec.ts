import { expect, test } from '@playwright/test';

test.describe('Authentication', () => {
  test('should load sign-in page', async ({ page }) => {
    // Try to navigate to the sign-in page
    const response = await page.goto('http://localhost:3000/auth/signin', {
      waitUntil: 'domcontentloaded',
      timeout: 10000,
    });

    // Check if the page loaded successfully
    expect(response).toBeTruthy();
    expect(response?.status()).toBe(200);

    // Check for sign-in page elements - Updated to match actual content
    await expect(page.locator('h1')).toContainText('Welcome Back!');
    // Check for any sign-in button or form
    const signInForm = page.locator('form');
    await expect(signInForm).toBeVisible();
  });

  test('should check if server is accessible', async ({ page }) => {
    try {
      const response = await page.goto('http://localhost:3000/', {
        waitUntil: 'domcontentloaded',
        timeout: 10000,
      });

      console.log('Server response status:', response?.status());
      expect(response).toBeTruthy();
    } catch (error) {
      console.error('Failed to connect to server:', error);
      throw error;
    }
  });
});
