import { test, expect } from '@playwright/test';

test.describe('CI E2E Tests', () => {
  test('should load the application', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveTitle(/ChatGPT Clone/);
  });

  test('should have basic structure', async ({ page }) => {
    await page.goto('/');

    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('should be responsive', async ({ page }) => {
    await page.goto('/');

    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('body')).toBeVisible();

    await page.setViewportSize({ width: 1920, height: 1080 });
    await expect(page.locator('body')).toBeVisible();
  });

  test('should handle navigation', async ({ page }) => {
    await page.goto('/');

    const currentUrl = page.url();
    expect(currentUrl).toContain('localhost');
  });
});
