// spec: Edge Cases
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';
import { login } from '../helpers/auth';


test.describe('Edge Cases', () => {
  test('Create event with very long title', async ({ page }) => {
    // Create a 200+ character title
    const longTitle = 'A'.repeat(200) + ' 매우 긴 제목 테스트';

    // 1. Navigate to calendar page
    await login(page);

    // 2. Open event creation dialog
    await page.getByRole('button', { name: '일정 추가' }).click();
    await expect(page.getByRole('dialog', { name: '일정 추가' })).toBeVisible();

    // 3. Enter a title with 200+ characters
    await page.getByRole('textbox', { name: '제목' }).fill(longTitle);

    // 4. Verify the title was entered correctly
    await expect(page.getByRole('textbox', { name: '제목' })).toHaveValue(longTitle);

    // 5. Save the event
    await page.getByRole('button', { name: '저장' }).click();

    // 6. Verify dialog closes (event created successfully)
    await expect(page.getByRole('dialog', { name: '일정 추가' })).not.toBeVisible();

    // 7. Verify UI is still functional
    await expect(page.getByRole('button', { name: '일정 추가' })).toBeVisible();
  });
});
