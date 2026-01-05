// spec: Test Suite: Event Management - Basic
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';
import { login } from '../helpers/auth';


test.describe('Event Management - Basic', () => {
  test('Date and time selection', async ({ page }) => {
    // Navigate to the calendar application home page
    await login(page);

    // 2. Click the '일정 추가' (Add Event) button
    await page.getByRole('button', { name: '일정 추가' }).click();

    // Verify dialog opened
    await expect(page.getByRole('dialog', { name: '일정 추가' })).toBeVisible();

    // 3. Verify date buttons are present (format: YYYY년 M월 D일)
    await expect(page.getByRole('button', { name: /\d{4}년 \d{1,2}월 \d{1,2}일/ }).first()).toBeVisible();

    // 4. Verify time input fields are present
    await expect(page.getByRole('textbox').nth(2)).toBeVisible();
    await expect(page.getByRole('textbox').nth(3)).toBeVisible();
  });
});
