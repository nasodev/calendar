// spec: Calendar Views - Date navigation in week view
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Calendar Views', () => {
  test('Date navigation in week view', async ({ page }) => {
    // 1. Login and navigate to calendar
    await page.goto('http://localhost:23002');
    await page.getByRole('textbox', { name: '이름' }).fill('환규');
    await page.getByRole('textbox', { name: '비밀번호' }).fill('hwankyu');
    await page.getByRole('button', { name: '로그인' }).click();

    // 2. Switch to week view by clicking '주' button
    await page.getByRole('button', { name: '주' }).click();
    await expect(page.getByText('2026년 1월 4일 - 10일')).toBeVisible();

    // 3. Click the left arrow (previous week) button
    await page.getByRole('button').first().click();

    // 4. Verify the header updates to show the previous week's date range
    await expect(page.getByText('12월 28일 - 1월 3일')).toBeVisible();

    // 5. Click the right arrow (next week) button twice
    await page.getByRole('button').nth(1).click();
    await expect(page.getByText('2026년 1월 4일 - 10일')).toBeVisible();

    // 6. Verify the header updates accordingly
    await page.getByRole('button').nth(1).click();
    await expect(page.getByText('2026년 1월 11일 - 17일')).toBeVisible();
  });
});
