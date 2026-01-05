// spec: Edge Cases - Create many recurring instances
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';
import { login } from '../helpers/auth';


test.describe('Edge Cases', () => {
  test('Create many recurring instances', async ({ page }) => {
    // 1. Navigate to calendar
    await login(page);

    // 2. Open event creation dialog
    await page.getByRole('button', { name: '일정 추가' }).click();
    await expect(page.getByRole('dialog', { name: '일정 추가' })).toBeVisible();

    // 3. Enter event title
    await page.getByRole('textbox', { name: '제목' }).fill('반복 테스트');

    // 4. Enable daily recurrence
    await page.getByRole('combobox').filter({ hasText: '반복 안 함' }).click();
    await page.getByRole('option', { name: '매일' }).click();

    // 5. Verify recurrence is set
    await expect(page.getByRole('combobox').filter({ hasText: '매일' })).toBeVisible();

    // 6. Save the event
    await page.getByRole('button', { name: '저장' }).click();

    // 7. Verify dialog closes
    await expect(page.getByRole('dialog', { name: '일정 추가' })).not.toBeVisible();
  });
});
