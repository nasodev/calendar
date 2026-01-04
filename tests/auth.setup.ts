// Authentication setup for Playwright tests
// This file logs in once and saves the authentication state for reuse

import { test as setup, expect } from '@playwright/test';

const authFile = '.auth/user.json';

setup('authenticate', async ({ page }) => {
  // Navigate to login page
  await page.goto('http://localhost:23002/login');

  // Enter credentials
  await page.getByRole('textbox', { name: '이름' }).fill('환규');
  await page.getByRole('textbox', { name: '비밀번호' }).fill('hwankyu');

  // Click login button
  await page.getByRole('button', { name: '로그인' }).click();

  // Wait for navigation to calendar page (with longer timeout for auth)
  await page.waitForURL('http://localhost:23002/', { timeout: 10000 });

  // Wait for calendar to load and verify login successful
  await expect(page.getByRole('button', { name: '일정 추가' })).toBeVisible({ timeout: 10000 });

  // Wait a bit longer to ensure Firebase has persisted auth state to localStorage
  await page.waitForTimeout(1000);

  // Save authentication state (includes localStorage with Firebase auth tokens)
  await page.context().storageState({ path: authFile });
});
