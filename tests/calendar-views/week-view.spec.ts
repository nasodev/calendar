// spec: Calendar Views
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Calendar Views', () => {
  test('Week view display', async ({ page }) => {
    // 1. Login and navigate to calendar
    await page.goto('http://localhost:23002/login');
    await page.getByRole('textbox', { name: '이름' }).fill('환규');
    await page.getByRole('textbox', { name: '비밀번호' }).fill('hwankyu');
    await page.getByRole('button', { name: '로그인' }).click();

    // 2. Click the '주' (Week) button in the view switcher
    await page.getByRole('button', { name: '주' }).click();

    // 3. Verify week view displays with date range in header (e.g., '12월 28일 - 1월 3일')
    await expect(page.getByRole('heading', { name: '2026년 1월 4일 - 10일' })).toBeVisible();

    // 4. Check that 7 day columns are shown with day names and dates
    await expect(page.getByText('일')).toBeVisible();
    await expect(page.getByText('토')).toBeVisible();

    // 5. Verify hourly time slots from 00:00 to 23:00 are displayed
    await expect(page.getByText('00:00')).toBeVisible();
    await expect(page.getByText('23:00')).toBeVisible();

    // 6. Check that time grid allows for event display at specific times
    await expect(page.getByText('카테고리 테스트')).toBeVisible();
  });
});
