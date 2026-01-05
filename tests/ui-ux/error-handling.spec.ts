// spec: UI/UX - Error handling and user messages
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';
import { login } from '../helpers/auth';


test.describe('UI/UX', () => {
  test('Error handling and user messages', async ({ page }) => {
    // 1. Navigate to calendar
    await login(page);

    // 2. Open event creation dialog
    await page.getByRole('button', { name: '일정 추가' }).click();
    await expect(page.getByRole('dialog', { name: '일정 추가' })).toBeVisible();

    // 3. Verify save button is disabled when title is empty
    const saveButton = page.getByRole('button', { name: '저장' });
    await expect(saveButton).toBeDisabled();

    // 4. Fill in title and verify save button becomes enabled
    await page.getByRole('textbox', { name: '제목' }).fill('Error Test Event');
    await expect(saveButton).toBeEnabled();

    // 5. Save the event
    await saveButton.click();

    // 6. Verify dialog closes (success)
    await expect(page.getByRole('dialog', { name: '일정 추가' })).not.toBeVisible();

    // 7. Verify calendar is still functional
    await expect(page.getByRole('button', { name: '일정 추가' })).toBeVisible();
  });
});
