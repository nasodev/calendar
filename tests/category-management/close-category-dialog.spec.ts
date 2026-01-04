// spec: Category Management - Close category dialog
// Authentication is handled via storageState (.auth/user.json)

import { test, expect } from '@playwright/test';

test.describe('Category Management', () => {
  test('Close category dialog', async ({ page }) => {
    // Navigate to calendar (already authenticated via storageState)
    await page.goto('/');

    // 1. Open category management dialog
    await page.getByRole('button').filter({ hasText: /^$/ }).nth(2).click();

    // 2. Click the Close button (X) in dialog header
    await page.getByRole('button', { name: 'Close' }).click();

    // 3. Verify dialog closes and calendar is visible
    await expect(page.getByRole('button', { name: '일정 추가' })).toBeVisible();
    await expect(page.getByRole('heading', { name: '2026년 1월' })).toBeVisible();
  });
});
