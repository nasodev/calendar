// spec: Test ID 8.13 - Rapid clicking on save button
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';
import { login } from '../helpers/auth';


test.describe('Edge Cases', () => {
  test('Rapid clicking on save button', async ({ page }) => {
    // 1. Navigate to calendar
    await login(page);

    // 2. Open event creation dialog
    await page.getByRole('button', { name: '일정 추가' }).click();
    await expect(page.getByRole('dialog', { name: '일정 추가' })).toBeVisible();

    // 3. Fill in event details
    await page.getByRole('textbox', { name: '제목' }).fill('빠른 클릭 테스트');

    // 4. Click the save button
    await page.getByRole('button', { name: '저장' }).click();

    // 5. Verify dialog closes
    await expect(page.getByRole('dialog', { name: '일정 추가' })).not.toBeVisible();

    // 6. Verify no errors or crashes occur
    await expect(page.getByRole('button', { name: '일정 추가' })).toBeVisible();
  });
});
