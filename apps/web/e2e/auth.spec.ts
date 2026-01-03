import { expect, test } from '@playwright/test';
import { getPremiumUser } from './test-users';

// Check if dynamic test users are available (DATABASE_URL was set for global setup)
const hasDynamicUsers = !!process.env.DATABASE_URL;

test.describe('Authentication', () => {
  test('should load sign-in page', async ({ page }) => {
    // Try to navigate to the sign-in page (uses baseURL from config)
    const response = await page.goto('/auth/signin', {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    });

    // Check if the page loaded successfully
    expect(response).toBeTruthy();
    expect(response?.status()).toBe(200);

    // Check for sign-in page elements
    await expect(page.locator('h1')).toContainText('Welcome Back!');
    // Check for any sign-in button or form
    const signInForm = page.locator('form');
    await expect(signInForm).toBeVisible();
  });

  test('should check if server is accessible', async ({ page }) => {
    const response = await page.goto('/', {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    });

    console.log('Server response status:', response?.status());
    expect(response).toBeTruthy();
    expect(response?.status()).toBe(200);
  });

  test('should display Google sign-in option', async ({ page }) => {
    await page.goto('/auth/signin');

    // Check for Google OAuth button
    const googleButton = page.locator('button:has-text("Google"), [data-testid="google-signin"]');
    await expect(googleButton).toBeVisible();
  });

  test('should display credentials sign-in form', async ({ page }) => {
    await page.goto('/auth/signin');

    // Check for email/password form
    await expect(page.locator('input[type="email"], [data-testid="email-input"]')).toBeVisible();
    await expect(page.locator('input[type="password"], [data-testid="password-input"]')).toBeVisible();
    await expect(page.locator('button[type="submit"], [data-testid="signin-button"]')).toBeVisible();
  });

  test('should show validation error for invalid credentials', async ({ page }) => {
    await page.goto('/auth/signin');

    // Fill with invalid credentials
    await page.fill('input[type="email"], [data-testid="email-input"]', 'invalid@test.com');
    await page.fill('input[type="password"], [data-testid="password-input"]', 'wrongpassword');
    await page.click('button[type="submit"], [data-testid="signin-button"]');

    // Should show error message or stay on sign-in page
    await expect(page).toHaveURL(/signin|error/);
  });

  // Uses dynamic test users created by global setup
  test('should successfully sign in with valid credentials', async ({ page }) => {
    test.skip(!hasDynamicUsers, 'Requires DATABASE_URL for dynamic test user creation');

    const premiumUser = getPremiumUser();
    await page.goto('/auth/signin');

    // Use dynamically created test user credentials
    await page.fill('input[type="email"], [data-testid="email-input"]', premiumUser.email);
    await page.fill('input[type="password"], [data-testid="password-input"]', premiumUser.password);
    await page.click('button[type="submit"], [data-testid="signin-button"]');

    // Should redirect away from sign-in page
    await page.waitForURL((url) => !url.pathname.includes('/auth/signin'), { timeout: 10000 });
  });
});
