// spec: Event Management - Basic
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';
import { login } from '../helpers/auth';

test.describe('Event Management - Basic', () => {
  test('Create simple event', async ({ page }) => {
    // 1. Login and navigate to calendar
    await login(page);

    // 2. Click the '일정 추가' (Add Event) button
    await page.getByRole('button', { name: '일정 추가' }).click();

    // Verify dialog opened
    await expect(page.getByRole('dialog', { name: '일정 추가' })).toBeVisible();

    // 3. Enter event title
    await page.getByRole('textbox', { name: '제목' }).fill('테스트 일정');

    // 4. Click the save/confirm button
    await page.getByRole('button', { name: '저장' }).click();

    // 5. Verify dialog closed
    await expect(page.getByRole('dialog', { name: '일정 추가' })).not.toBeVisible();
  });
});
