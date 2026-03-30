import { test, expect } from '@playwright/test';

const uniqueUser = () => `e2euser_${Date.now()}`;

test.describe('Authentication', () => {
  test('login page renders correctly', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByText(/RPS.*ARENA/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /login/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /register/i })).toBeVisible();
  });

  test('register a new user and redirect to game', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('button', { name: /register/i }).click();

    const username = uniqueUser();
    await page.getByLabel(/username/i).fill(username);
    await page.getByLabel(/password/i).fill('testpass123');
    await page.getByRole('button', { name: /create player/i }).click();

    await expect(page).toHaveURL('/', { timeout: 8000 });
    await expect(page.getByRole('button', { name: /logout/i })).toBeVisible();
  });

  test('shows error on duplicate username', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('button', { name: /register/i }).click();

    // Register first time
    const username = uniqueUser();
    await page.getByLabel(/username/i).fill(username);
    await page.getByLabel(/password/i).fill('testpass123');
    await page.getByRole('button', { name: /create player/i }).click();
    await page.waitForURL('/', { timeout: 10000 });

    // Try to register same username again
    await page.goto('/login');
    await page.getByRole('button', { name: /register/i }).click();
    await page.getByLabel(/username/i).fill(username);
    await page.getByLabel(/password/i).fill('testpass123');
    await page.getByRole('button', { name: /create player/i }).click();

    await expect(page.locator('p[role="alert"]')).toContainText(/taken|already/i);
  });

  test('shows error on wrong password', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel(/username/i).fill('nonexistentuser');
    await page.getByLabel(/password/i).fill('wrongpass');
    await page.getByRole('button', { name: /enter arena/i }).click();

    await expect(page.locator('p[role="alert"]')).toBeVisible();
  });

  test('logout clears session and shows login link', async ({ page }) => {
    // Register and login
    await page.goto('/login');
    await page.getByRole('button', { name: /register/i }).click();
    const username = uniqueUser();
    await page.getByLabel(/username/i).fill(username);
    await page.getByLabel(/password/i).fill('testpass123');
    await page.getByRole('button', { name: /create player/i }).click();
    await page.waitForURL('/');

    // Logout
    await page.getByRole('button', { name: /logout/i }).click();
    await page.waitForURL('/login');
    await expect(page.getByRole('button', { name: /enter arena/i })).toBeVisible();
  });

  test('guest can still play after visiting login', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('link', { name: /play as guest/i }).click();
    await expect(page).toHaveURL('/');
    await expect(page.getByRole('button', { name: /rock/i })).toBeVisible();
  });
});
