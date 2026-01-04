// spec: Calendar Views - Month view display
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Calendar Views', () => {
  test('Month view display', async ({ page }) => {
    // Navigate to login page
    await page.goto('http://localhost:23002/login');

    // Login
    await page.getByRole('textbox', { name: '이름' }).fill('환규');
    await page.getByRole('textbox', { name: '비밀번호' }).fill('hwankyu');
    await page.getByRole('button', { name: '로그인' }).click();

    // Wait for navigation to calendar
    await page.waitForURL('http://localhost:23002/', { timeout: 10000 });

    // 2. Verify month view is the default view - Check '월' button is visible
    await expect(page.getByRole('button', { name: '월' })).toBeVisible();

    // 3. Check that current month and year are displayed in header
    await expect(page.getByRole('heading', { name: '2026년 1월' })).toBeVisible();

    // 4. Verify calendar grid shows 7 columns - Check weekday headers
    const weekdayHeaders = page.locator('.grid.grid-cols-7.border-b');
    await expect(weekdayHeaders.getByText('일')).toBeVisible();
    await expect(weekdayHeaders.getByText('월')).toBeVisible();
    await expect(weekdayHeaders.getByText('화')).toBeVisible();
    await expect(weekdayHeaders.getByText('수')).toBeVisible();
    await expect(weekdayHeaders.getByText('목')).toBeVisible();
    await expect(weekdayHeaders.getByText('금')).toBeVisible();
    await expect(weekdayHeaders.getByText('토')).toBeVisible();

    // 5. Verify all days of the month are displayed - Check that calendar grid exists
    const calendarGrid = page.locator('.flex-1.grid.grid-cols-7.auto-rows-fr');
    await expect(calendarGrid).toBeVisible();

    // 5. Verify day 1 is visible in the calendar grid
    await expect(calendarGrid.locator('div', { hasText: /^1$/ }).first()).toBeVisible();

    // 5. Verify day 31 (last day of January) is visible in the calendar grid
    await expect(calendarGrid.locator('div', { hasText: /^31$/ }).first()).toBeVisible();

    // 6. Verify days from previous/next month are shown in grid - Check day 28 is visible
    await expect(calendarGrid.locator('div', { hasText: /^28$/ }).first()).toBeVisible();
  });
});
