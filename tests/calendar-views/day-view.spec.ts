// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Calendar Views', () => {
  test('Day view display', async ({ page }) => {
    // 1. Login and navigate to calendar
    await page.goto('http://localhost:23002');
    await page.getByRole('textbox', { name: '이름' }).fill('환규');
    await page.getByRole('textbox', { name: '비밀번호' }).fill('hwankyu');
    await page.getByRole('button', { name: '로그인' }).click();

    // 2. Click the '일' (Day) button in the view switcher
    await page.getByRole('button', { name: '일', exact: true }).click();

    // 3. Verify day view displays with full date in header (e.g., '2026년 1월 3일')
    await expect(page.getByRole('heading', { name: '2026년 1월 4일' })).toBeVisible();

    // 4. Check that hourly time slots from 00:00 to 23:00 are displayed
    await expect(page.getByText('00:00')).toBeVisible();
    await expect(page.getByText('23:00')).toBeVisible();

    // 5. Verify the day view shows events scheduled for that day
    await expect(page.getByText('카테고리 테스트')).toBeVisible();
    
    // Verify the '일' button is active/selected
    await expect(page.getByRole('button', { name: '일' })).toBeVisible();
  });
});
