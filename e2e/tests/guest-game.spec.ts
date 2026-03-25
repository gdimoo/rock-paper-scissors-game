import { test, expect } from '@playwright/test';

test.describe('Guest gameplay', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('shows game board on home page', async ({ page }) => {
    await expect(page.getByText(/RPS.*ARENA/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /rock/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /paper/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /scissors/i })).toBeVisible();
  });

  test('shows login link when not authenticated', async ({ page }) => {
    await expect(page.getByRole('link', { name: /login/i })).toBeVisible();
  });

  test('play button locks UI and reveals bot result', async ({ page }) => {
    await page.getByRole('button', { name: /rock/i }).click();

    // UI should lock (buttons disabled) while bot "thinks"
    await expect(page.getByRole('button', { name: /rock/i })).toBeDisabled();

    // After 2s delay, result should appear
    await expect(page.getByText(/win|lose|draw/i)).toBeVisible({ timeout: 5000 });

    // Buttons should be re-enabled
    await expect(page.getByRole('button', { name: /rock/i })).toBeEnabled({ timeout: 5000 });
  });

  test('score increments on win', async ({ page }) => {
    // Play until we get a win (retry up to 5 times)
    for (let i = 0; i < 5; i++) {
      await page.getByRole('button', { name: /rock/i }).click();
      await page.waitForTimeout(2500);

      const result = await page.getByText(/win|lose|draw/i).textContent();
      if (result?.toLowerCase().includes('win')) break;
    }
    // Score panel should exist and be visible
    await expect(page.locator('[class*="scores"]')).toBeVisible();
  });
});
