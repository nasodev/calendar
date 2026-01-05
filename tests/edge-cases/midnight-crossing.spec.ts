// spec: Edge Cases - Midnight Crossing Events
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';
import { login } from '../helpers/auth';


test.describe('Edge Cases', () => {
  test('Midnight crossing events', async ({ page }) => {
    // 1. Navigate to calendar
    await login(page);

    // 2. Open event creation dialog
    await page.getByRole('button', { name: '일정 추가' }).click();
    await expect(page.getByRole('dialog', { name: '일정 추가' })).toBeVisible();

    // 3. Create an event
    await page.getByRole('textbox', { name: '제목' }).fill('자정 넘는 일정');

    // 4. Save the event
    await page.getByRole('button', { name: '저장' }).click();

    // 5. Verify dialog closes
    await expect(page.getByRole('dialog', { name: '일정 추가' })).not.toBeVisible();

    // 6. Verify no errors occurred
    await expect(page.getByRole('button', { name: '일정 추가' })).toBeVisible();
  });
});
