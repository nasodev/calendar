// spec: Edge Cases
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';
import { login } from '../helpers/auth';


test.describe('Edge Cases', () => {
  test('Create event with emoji', async ({ page }) => {
    // 1. Navigate to calendar page
    await login(page);

    // 2. Open event creation dialog
    await page.getByRole('button', { name: '일정 추가' }).click();
    await expect(page.getByRole('dialog', { name: '일정 추가' })).toBeVisible();

    // 3. Enter title with emoji
    await page.getByRole('textbox', { name: '제목' }).fill('🎉 파티 🎂');

    // 4. Save the event
    await page.getByRole('button', { name: '저장' }).click();

    // 5. Verify dialog closes (event created successfully)
    await expect(page.getByRole('dialog', { name: '일정 추가' })).not.toBeVisible();
  });
});
