// spec: Calendar Views - Click on date in month view
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';
import { login } from '../helpers/auth';

test.describe('Calendar Views', () => {
  test('Click on date in month view', async ({ page }) => {
    // 1. Login and navigate to calendar in month view
    await login(page);

    // 2. Click on a specific date number in the calendar grid
    // Use a date cell in the middle of the month to avoid edge cases
    const dateCell = page.locator('.text-xs.md\\:text-sm').filter({ hasText: '15' }).first();
    await dateCell.click();

    // 3. Verify the event creation dialog opens
    await expect(page.getByRole('dialog', { name: '일정 추가' })).toBeVisible();

    // 4. Verify the dialog has date selection controls
    await expect(page.getByRole('button', { name: /\d{4}년 \d{1,2}월 \d{1,2}일/ }).first()).toBeVisible();
  });
});
