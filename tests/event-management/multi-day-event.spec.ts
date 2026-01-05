// spec: Event Management - Basic
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';
import { login } from '../helpers/auth';


test.describe('Event Management - Basic', () => {
  test('Multi-day event', async ({ page }) => {
    // Navigate to the calendar application
    await login(page);

    // 2. Click the '일정 추가' (Add Event) button
    await page.getByRole('button', { name: '일정 추가' }).click();

    // 3. Verify dialog opened
    await expect(page.getByRole('dialog', { name: '일정 추가' })).toBeVisible();

    // 4. Enter event title
    await page.getByRole('textbox', { name: '제목' }).fill('여행 일정');

    // 5. Verify date buttons are present
    await expect(page.getByRole('button', { name: /\d{4}년 \d{1,2}월 \d{1,2}일/ }).first()).toBeVisible();

    // 6. Save the event
    await page.getByRole('button', { name: '저장' }).click();

    // 7. Verify dialog closed
    await expect(page.getByRole('dialog', { name: '일정 추가' })).not.toBeVisible();
  });
});
