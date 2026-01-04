// spec: Test 8.3 - Create event with special characters
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';
import { login } from '../helpers/auth';


test.describe('Edge Cases', () => {
  test('Create event with special characters', async ({ page }) => {
    // 1. Navigate to calendar (already authenticated via storageState)
    await login(page);

    // 2. Open event creation dialog by clicking "일정 추가" button
    await page.getByRole('button', { name: '일정 추가' }).click();

    // 3. Enter title with special characters: <>"'!@#$%^&*()
    await page.getByRole('textbox', { name: '제목' }).fill('<>"\'!@#$%^&*()');

    // 4. Fill in date/time and save (using default date and time values)
    await page.getByRole('button', { name: '저장' }).click();

    // 5. Verify the event is displayed correctly with special characters preserved
    await expect(page.getByText('<>"\'!@#$%^&*()')).toBeVisible();
  });
});
