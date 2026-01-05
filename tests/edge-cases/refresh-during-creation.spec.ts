// spec: Test 8.7 - Page refresh during event creation
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';
import { login } from '../helpers/auth';


test.describe('Edge Cases', () => {
  test('Page refresh during event creation', async ({ page }) => {
    // 1. Navigate to calendar
    await login(page);

    // 2. Open event creation dialog
    await page.getByRole('button', { name: '일정 추가' }).click();
    await expect(page.getByRole('dialog', { name: '일정 추가' })).toBeVisible();

    // 3. Fill in some event details
    await page.getByRole('textbox', { name: '제목' }).fill('새로고침 테스트 일정');

    // 4. Refresh the page
    await page.reload();

    // 5. Wait for calendar to reload and verify it's in normal state
    await expect(page.getByRole('heading', { name: /\d{4}년 \d{1,2}월$/ })).toBeVisible();

    // 6. Verify dialog is closed and calendar is functional
    await expect(page.getByRole('button', { name: '일정 추가' })).toBeVisible();
  });
});
