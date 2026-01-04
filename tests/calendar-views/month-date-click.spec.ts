// spec: Calendar Views - Click on date in month view
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Calendar Views', () => {
  test('Click on date in month view', async ({ page }) => {
    // 1. Login and navigate to calendar in month view
    await page.goto('http://localhost:23002/login');
    await page.getByRole('textbox', { name: '이름' }).fill('환규');
    await page.getByRole('textbox', { name: '비밀번호' }).fill('hwankyu');
    await page.getByRole('button', { name: '로그인' }).click();

    // 2. Click on a specific date number in the calendar grid (e.g., day 15)
    await page.getByText('15').click();

    // 3. Verify the event creation dialog opens
    await expect(page.getByRole('heading', { name: '일정 추가' })).toBeVisible();
    
    // Verify date context is preserved - the clicked date should appear in the dialog
    await expect(page.getByRole('button', { name: '2026년 1월 15일' })).toBeVisible();
  });
});
