import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display the page title', async ({ page }) => {
    await expect(page).toHaveTitle('Holiday Program Aggregator');
  });

  test('should display the main heading', async ({ page }) => {
    const heading = page.locator('h1');
    await expect(heading).toBeVisible();
    await expect(heading).toContainText('Holiday Program');
    await expect(heading).toContainText('Aggregator');
  });

  test('should have purple gradient background', async ({ page }) => {
    const main = page.locator('main');
    await expect(main).toBeVisible();
    
    // Check that the main element has the gradient background
    const background = await main.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return style.background || style.backgroundImage;
    });
    
    expect(background).toContain('gradient');
  });

  test('should display health check card', async ({ page }) => {
    const healthCard = page.locator('text=Health Check');
    await expect(healthCard).toBeVisible();
  });

  test('should display health check status', async ({ page }) => {
    // Wait for the API call to complete
    await page.waitForResponse('**/api/trpc/healthz.healthz*');
    
    const status = page.locator('text=Status: ok');
    await expect(status).toBeVisible({ timeout: 10000 });
    
    const timestamp = page.locator('text=Time:');
    await expect(timestamp).toBeVisible();
  });

  test('should have white text', async ({ page }) => {
    const heading = page.locator('h1');
    const color = await heading.evaluate((el) => {
      return window.getComputedStyle(el).color;
    });
    
    // White text should be rgb(255, 255, 255)
    expect(color).toBe('rgb(255, 255, 255)');
  });

  test('should have semi-transparent card background', async ({ page }) => {
    const card = page.locator('text=Health Check').locator('..');
    const backgroundColor = await card.evaluate((el) => {
      return window.getComputedStyle(el).backgroundColor;
    });
    
    // Should have alpha transparency
    expect(backgroundColor).toContain('rgba');
  });
});