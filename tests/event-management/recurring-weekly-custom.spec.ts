// spec: Event Management - Recurring
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';
import { login } from '../helpers/auth';


test.describe('Event Management - Recurring', () => {
  test('Create weekly recurring event with specific weekdays', async ({ page }) => {
    // Navigate to calendar application
    await login(page);

    // 2. Click the '일정 추가' (Add Event) button
    await page.getByRole('button', { name: '일정 추가' }).click();

    // 3. Enter event title
    await page.getByRole('textbox', { name: '제목' }).fill('헬스장');

    // 4. Enable recurrence option - Click repeat dropdown
    await page.getByRole('combobox').filter({ hasText: '반복 안 함' }).click();

    // 5. Select 'Weekly' (매주) frequency
    await page.getByRole('option', { name: '매주' }).click();

    // 6. Verify weekday buttons appear
    await expect(page.getByRole('button', { name: '월', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: '수' })).toBeVisible();
    await expect(page.getByRole('button', { name: '금' })).toBeVisible();

    // 7. Save the event
    await page.getByRole('button', { name: '저장' }).click();

    // 8. Verify dialog closed
    await expect(page.getByRole('dialog', { name: '일정 추가' })).not.toBeVisible();
  });
});
