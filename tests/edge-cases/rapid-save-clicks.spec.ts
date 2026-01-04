// spec: Test ID 8.13 - Rapid clicking on save button
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';
import { login } from '../helpers/auth';


test.describe('Edge Cases', () => {
  test('Rapid clicking on save button', async ({ page }) => {
    // 1. Navigate to calendar (already authenticated via storageState)
    await login(page);

    // 2. Open event creation dialog by clicking "일정 추가"
    await page.getByRole('button', { name: '일정 추가' }).click();

    // 3. Fill in event details (title: "빠른 클릭 테스트")
    await page.getByRole('textbox', { name: '제목' }).fill('빠른 클릭 테스트');

    // 4. Rapidly click the save button multiple times
    const saveButton = page.getByRole('button', { name: '저장' });
    
    // Click rapidly 5 times using Promise.all for simultaneous clicks
    await Promise.all([
      saveButton.click(),
      saveButton.click({ force: true }),
      saveButton.click({ force: true }),
      saveButton.click({ force: true }),
      saveButton.click({ force: true })
    ]);

    // Wait for dialog to close
    await expect(page.getByRole('dialog', { name: '일정 추가' })).not.toBeVisible();

    // 5. Verify only one event is created (not duplicates)
    const eventCount = await page.locator('p:text("빠른 클릭 테스트")').count();
    expect(eventCount).toBe(1);

    // 6. Verify no errors or crashes occur
    // The page should still be functional
    await expect(page.getByRole('button', { name: '일정 추가' })).toBeVisible();
    await expect(page.getByRole('heading', { name: /2026년/ })).toBeVisible();
  });
});
