// spec: Event Management - Basic
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';
import { login } from '../helpers/auth';


test.describe('Event Management - Basic', () => {
  test('Cancel event creation', async ({ page }) => {
    // Navigate and login
    await login(page);

    // 2. Click the '일정 추가' (Add Event) button
    await page.getByRole('button', { name: '일정 추가' }).click();

    // Verify dialog opened
    await expect(page.getByRole('dialog', { name: '일정 추가' })).toBeVisible();

    // 3. Enter some event details (title)
    await page.getByRole('textbox', { name: '제목' }).fill('테스트 취소 일정');

    // 4. Click the cancel button
    await page.getByRole('button', { name: '취소' }).click();

    // 5. Verify the dialog closes
    await expect(page.getByRole('dialog', { name: '일정 추가' })).not.toBeVisible();
  });
});
