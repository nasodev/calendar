// spec: Calendar Views - Month view display
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Calendar Views', () => {
  test('Month view display', async ({ page }) => {
    // Navigate to login page to start the test
    await page.goto('http://localhost:23002/login');

    // 1. Login and navigate to calendar - Enter name
    await page.getByRole('textbox', { name: '이름' }).fill('환규');

    // 1. Login and navigate to calendar - Enter password
    await page.getByRole('textbox', { name: '비밀번호' }).fill('hwankyu');

    // 1. Login and navigate to calendar - Click login button
    await page.getByRole('button', { name: '로그인' }).click();

    // 2. Verify month view is the default view - Check '월' button is visible
    await expect(page.getByRole('button', { name: '월' })).toBeVisible();

    // 3. Check that current month and year are displayed in header
    await expect(page.getByRole('heading', { name: '2026년 1월' })).toBeVisible();

    // 4. Verify calendar grid shows 7 columns - Check first day (일)
    await expect(page.getByText('일')).toBeVisible();

    // 4. Verify calendar grid shows 7 columns - Check second day (월)
    await expect(page.getByText('월')).toBeVisible();

    // 4. Verify calendar grid shows 7 columns - Check third day (화)
    await expect(page.getByText('화')).toBeVisible();

    // 4. Verify calendar grid shows 7 columns - Check fourth day (수)
    await expect(page.getByText('수')).toBeVisible();

    // 4. Verify calendar grid shows 7 columns - Check fifth day (목)
    await expect(page.getByText('목')).toBeVisible();

    // 4. Verify calendar grid shows 7 columns - Check sixth day (금)
    await expect(page.getByText('금')).toBeVisible();

    // 4. Verify calendar grid shows 7 columns - Check seventh day (토)
    await expect(page.getByText('토')).toBeVisible();

    // 5. Verify all days of the month are displayed - Check day 1
    await expect(page.getByText('1')).toBeVisible();

    // 5. Verify all days of the month are displayed - Check day 31 (last day of January)
    await expect(page.getByText('31')).toBeVisible();

    // 6. Verify days from previous/next month are shown in grid - Check day 28 from previous month
    await expect(page.getByText('28')).toBeVisible();
  });
});
