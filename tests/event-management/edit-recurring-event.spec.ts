// spec: Event Management - Recurring
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';
import { login } from '../helpers/auth';


test.describe('Event Management - Recurring', () => {
  test('Edit recurring event', async ({ page }) => {
    // Navigate to the calendar application
    await login(page);

    // 2. Create a recurring event first
    await page.getByRole('button', { name: '일정 추가' }).click();
    await page.getByRole('textbox', { name: '제목' }).fill('수정할 반복일정');

    // Enable recurrence
    await page.getByRole('combobox').filter({ hasText: '반복 안 함' }).click();
    await page.getByRole('option', { name: '매일' }).click();

    // Save
    await page.getByRole('button', { name: '저장' }).click();

    // Verify dialog closed
    await expect(page.getByRole('dialog', { name: '일정 추가' })).not.toBeVisible();
  });
});
