// spec: Event Management - Basic
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Event Management - Basic', () => {
  test('Close event dialog using X button', async ({ page }) => {
    // 1. Login and navigate to calendar
    await page.goto('http://localhost:23002');
    await page.getByText("로그인").first().waitFor({ state: 'visible' });
    await page.getByRole('textbox', { name: '이름' }).fill('환규');
    await page.getByRole('textbox', { name: '비밀번호' }).fill('hwankyu');
    await page.getByRole('button', { name: '로그인' }).click();

    // 2. Click the '일정 추가' (Add Event) button
    await page.getByRole('button', { name: '일정 추가' }).click();

    // Verify dialog is visible
    await expect(page.getByRole('dialog', { name: '일정 추가' })).toBeVisible();

    // 3. Click the X button (close button) on the dialog
    await page.getByRole('button', { name: 'Close' }).click();

    // 4. Verify the dialog closes
    await expect(page.getByRole('dialog', { name: '일정 추가' })).not.toBeVisible();

    // 5. Verify no event was created (only original events exist)
    await expect(page.getByText('테스트 일정')).toBeVisible();
    await expect(page.getByText('월례 보고')).toBeVisible();
    await expect(page.getByText('기념일')).toBeVisible();
  });
});
