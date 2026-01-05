// spec: specs/test-plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';
import { login } from '../helpers/auth';


test.describe('Edge Cases', () => {
  test('Empty description field', async ({ page }) => {
    // 1. Navigate to calendar
    await login(page);

    // 2. Open event creation dialog
    await page.getByRole('button', { name: '일정 추가' }).click();
    await expect(page.getByRole('dialog', { name: '일정 추가' })).toBeVisible();

    // 3. Enter event title only, leave description empty
    await page.getByRole('textbox', { name: '제목' }).fill('Empty Description Test');

    // 4. Verify description field exists and is empty
    const descriptionField = page.getByRole('textbox', { name: '설명' });
    await expect(descriptionField).toBeVisible();

    // 5. Save the event
    await page.getByRole('button', { name: '저장' }).click();

    // 6. Verify event is created successfully (dialog closes)
    await expect(page.getByRole('dialog', { name: '일정 추가' })).not.toBeVisible();
  });
});
