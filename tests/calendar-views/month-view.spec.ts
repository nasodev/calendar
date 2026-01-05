// spec: Calendar Views - Month view display
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';
import { login } from '../helpers/auth';

test.describe('Calendar Views', () => {
  test('Month view display', async ({ page }) => {
    // 1. Login and navigate to calendar
    await login(page);

    // 2. Verify month view is the default view - Check '월' button is visible
    await expect(page.getByRole('button', { name: '월' })).toBeVisible();

    // 3. Check that month and year are displayed in header (format: YYYY년 M월)
    await expect(page.getByRole('heading', { name: /\d{4}년 \d{1,2}월$/ })).toBeVisible();

    // 4. Verify calendar grid shows 7 columns - Check weekday headers exist
    // Use more flexible selectors for weekday headers
    await expect(page.getByText('일', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('토', { exact: true }).first()).toBeVisible();

    // 5. Verify calendar grid exists and has day numbers
    const calendarGrid = page.locator('.flex-1.grid.grid-cols-7');
    await expect(calendarGrid).toBeVisible();

    // Verify day 1 is visible in the calendar
    await expect(page.locator('.text-xs.md\\:text-sm').filter({ hasText: '1' }).first()).toBeVisible();

    // Verify day 15 is visible (middle of month)
    await expect(page.locator('.text-xs.md\\:text-sm').filter({ hasText: '15' }).first()).toBeVisible();
  });
});
