// spec: Event Management - Recurring
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';
import { login } from '../helpers/auth';

test.describe('Event Management - Recurring', () => {
  test('Create yearly recurring event', async ({ page }) => {
    // 1. Login and navigate to calendar
    await login(page);

    // 2. Click the '일정 추가' (Add Event) button
    await page.getByRole('button', { name: '일정 추가' }).click();

    // 3. Enter event title
    await page.getByRole('textbox', { name: '제목' }).fill('생일');

    // 4. Enable recurrence option
    await page.getByRole('combobox').filter({ hasText: '반복 안 함' }).click();

    // 5. Select 'Yearly' (매년) frequency
    await page.getByRole('option', { name: '매년' }).click();

    // 6. Verify yearly option was selected
    await expect(page.getByRole('combobox').filter({ hasText: '매년' })).toBeVisible();

    // 7. Save the event
    await page.getByRole('button', { name: '저장' }).click();

    // 8. Verify dialog closed
    await expect(page.getByRole('dialog', { name: '일정 추가' })).not.toBeVisible();
  });
});
