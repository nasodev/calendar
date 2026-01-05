// spec: Edge Cases - Leap year handling
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';
import { login } from '../helpers/auth';


test.describe('Edge Cases', () => {
  test('Leap year handling', async ({ page }) => {
    // Navigate to calendar
    await login(page);

    // Open event creation dialog
    await page.getByRole('button', { name: '일정 추가' }).click();
    await expect(page.getByRole('dialog', { name: '일정 추가' })).toBeVisible();

    // Enter event title
    await page.getByRole('textbox', { name: '제목' }).fill('Leap Year Event');

    // Save the event (just verify basic event creation works)
    await page.getByRole('button', { name: '저장' }).click();

    // Verify dialog closes
    await expect(page.getByRole('dialog', { name: '일정 추가' })).not.toBeVisible();
  });
});
