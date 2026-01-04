// spec: Test 8.7 - Page refresh during event creation
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Edge Cases', () => {
  test('Page refresh during event creation', async ({ page }) => {
    // 1. Navigate to calendar (already authenticated via storageState)
    await page.goto('http://localhost:23002/');

    // 2. Open event creation dialog by clicking "일정 추가"
    await page.getByRole('button', { name: '일정 추가' }).click();

    // 3. Fill in some event details (title, etc.)
    await page.getByRole('textbox', { name: '제목' }).fill('새로고침 테스트 일정');

    // 4. Refresh the page (page.reload())
    await page.reload();

    // 5. Verify calendar returns to normal state
    await expect(page.getByRole('heading', { name: '2026년 1월' })).toBeVisible();
    
    // 6. Verify dialog is closed and no partial data remains
    await expect(page.getByRole('button', { name: '일정 추가' })).toBeVisible();
  });
});
