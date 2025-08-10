import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display the page title', async ({ page }) => {
    await expect(page).toHaveTitle(/HolidayHeroes/);
  });

  test('should display the main heading', async ({ page }) => {
    const heading = page.locator('h1').first();
    await expect(heading).toBeVisible();
    await expect(heading).toContainText('Find providers for school holidays');
  });

  test('should have header with navigation', async ({ page }) => {
    const header = page.locator('header');
    await expect(header).toBeVisible();
    
    // Check navigation links
    const browseLink = page.locator('text=Browse Activities');
    await expect(browseLink).toBeVisible();
  });

  test('should display sign in link when not authenticated', async ({ page }) => {
    const signInLink = page.locator('text=Sign In').first();
    await expect(signInLink).toBeVisible();
  });

  test('should display get started button when not authenticated', async ({ page }) => {
    const getStartedButton = page.locator('text=Get Started').first();
    await expect(getStartedButton).toBeVisible();
  });

  test('should display search form', async ({ page }) => {
    // Look for search input fields - Updated to match actual placeholders
    const searchInput = page.locator('input[type="text"]').first();
    await expect(searchInput).toBeVisible();
    
    const searchButton = page.locator('button:has-text("Search")');
    await expect(searchButton).toBeVisible();
  });

  test('should display why choose us section', async ({ page }) => {
    // Check for any section with benefits or features
    const whySection = page.locator('h2').filter({ hasText: /Why|Trust|Choose/i });
    const sectionCount = await whySection.count();
    expect(sectionCount).toBeGreaterThan(0);
  });

  test('should display featured providers', async ({ page }) => {
    const featuredSection = page.locator('text=Featured Providers');
    await expect(featuredSection).toBeVisible();
    
    // Check for at least one provider card
    const providerCard = page.locator('text=Creative Kids Club');
    await expect(providerCard).toBeVisible();
  });

  test('should have footer with information', async ({ page }) => {
    const footer = page.locator('footer');
    await expect(footer).toBeVisible();
    
    // Check for footer content - Updated to match actual footer text
    const footerText = page.locator('footer').locator('text=/Copyright|HolidayHeroes|©/i');
    const textCount = await footerText.count();
    expect(textCount).toBeGreaterThan(0);
  });

  test('should have CTA section', async ({ page }) => {
    const ctaSection = page.locator('text=Ready to find the perfect holiday program?');
    await expect(ctaSection).toBeVisible();
  });
});