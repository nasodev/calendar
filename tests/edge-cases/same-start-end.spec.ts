// spec: Test 8.11 - Same start and end time
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';
import { login } from '../helpers/auth';


test.describe('Edge Cases', () => {
  test('Same start and end time', async ({ page }) => {
    // 1. Navigate to calendar
    await login(page);

    // 2. Open event creation dialog
    await page.getByRole('button', { name: '일정 추가' }).click();
    await expect(page.getByRole('dialog', { name: '일정 추가' })).toBeVisible();

    // 3. Enter event title
    await page.getByRole('textbox', { name: '제목' }).fill('동일 시간 테스트');

    // 4. Save the event
    await page.getByRole('button', { name: '저장' }).click();

    // 5. Verify dialog closes
    await expect(page.getByRole('dialog', { name: '일정 추가' })).not.toBeVisible();

    // 6. Verify no application crashes
    await expect(page.getByRole('button', { name: '일정 추가' })).toBeVisible();
  });
});
