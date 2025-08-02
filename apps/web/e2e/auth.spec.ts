import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('should load sign-in page', async ({ page }) => {
    // Try to navigate to the sign-in page
    const response = await page.goto('http://localhost:3000/auth/signin', {
      waitUntil: 'domcontentloaded',
      timeout: 10000
    });
    
    // Check if the page loaded successfully
    expect(response).toBeTruthy();
    expect(response?.status()).toBe(200);
    
    // Check for sign-in page elements
    await expect(page.locator('h1')).toContainText('Sign In');
    await expect(page.locator('button:has-text("Sign in with Google")')).toBeVisible();
  });

  test('should check if server is accessible', async ({ page }) => {
    try {
      const response = await page.goto('http://localhost:3000/', {
        waitUntil: 'domcontentloaded',
        timeout: 10000
      });
      
      console.log('Server response status:', response?.status());
      expect(response).toBeTruthy();
    } catch (error) {
      console.error('Failed to connect to server:', error);
      throw error;
    }
  });
});