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

  test('should display sign in link when not authenticated', async ({ page }) => {
    const signInLink = page.locator('text=Sign In →');
    await expect(signInLink).toBeVisible();
  });

  test('should display welcome message when not authenticated', async ({ page }) => {
    const welcomeText = page.locator('text=Welcome!');
    await expect(welcomeText).toBeVisible();
    
    const signInPrompt = page.locator('text=Sign in to start your subscription');
    await expect(signInPrompt).toBeVisible();
  });

  test('should display features card', async ({ page }) => {
    const featuresCard = page.locator('text=Features');
    await expect(featuresCard).toBeVisible();
    
    const features = page.locator('text=Curated holiday programs');
    await expect(features).toBeVisible();
  });

  test('should display benefits card', async ({ page }) => {
    const benefitsCard = page.locator('text=Benefits');
    await expect(benefitsCard).toBeVisible();
    
    const benefits = page.locator('text=Save time searching');
    await expect(benefits).toBeVisible();
  });

  test('should have white text', async ({ page }) => {
    // Check if the heading has the text-white class
    const heading = page.locator('h1');
    const hasWhiteTextClass = await heading.evaluate((el) => {
      return el.classList.contains('text-white');
    });
    
    expect(hasWhiteTextClass).toBe(true);
  });

  test('should have semi-transparent card background', async ({ page }) => {
    const card = page.locator('text=Features').locator('..');
    const backgroundColor = await card.evaluate((el) => {
      return window.getComputedStyle(el).backgroundColor;
    });
    
    // Should have alpha transparency
    expect(backgroundColor).toContain('rgba');
  });
});