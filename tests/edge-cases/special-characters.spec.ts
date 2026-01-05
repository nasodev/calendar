// spec: Test 8.3 - Create event with special characters
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';
import { login } from '../helpers/auth';


test.describe('Edge Cases', () => {
  test('Create event with special characters', async ({ page }) => {
    // 1. Navigate to calendar
    await login(page);

    // 2. Open event creation dialog
    await page.getByRole('button', { name: '일정 추가' }).click();
    await expect(page.getByRole('dialog', { name: '일정 추가' })).toBeVisible();

    // 3. Enter title with special characters
    await page.getByRole('textbox', { name: '제목' }).fill('<>"\'!@#$%^&*()');

    // 4. Verify the title was entered correctly
    await expect(page.getByRole('textbox', { name: '제목' })).toHaveValue('<>"\'!@#$%^&*()');

    // 5. Save the event
    await page.getByRole('button', { name: '저장' }).click();

    // 6. Verify dialog closes (event created successfully)
    await expect(page.getByRole('dialog', { name: '일정 추가' })).not.toBeVisible();
  });
});
