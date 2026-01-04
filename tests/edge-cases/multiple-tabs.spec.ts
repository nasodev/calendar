// spec: specs/plan.md
// Test ID: 8.8
// Test: Multiple browser tabs

import { test, expect } from '@playwright/test';
import { login } from '../helpers/auth';


test.describe('Edge Cases', () => {
  test('Multiple browser tabs', async ({ page, context }) => {
    // 1. Navigate to calendar in first tab (already authenticated via storageState)
    await login(page);
    await expect(page.getByRole('button', { name: '일정 추가' })).toBeVisible();

    // 2. Open a new tab with same URL (context.newPage())
    const secondTab = await context.newPage();
    await secondTab.goto('/');
    await expect(secondTab.getByRole('button', { name: '일정 추가' })).toBeVisible();

    // 3. Create an event in the first tab
    await page.getByRole('button', { name: '일정 추가' }).click();
    await page.getByRole('textbox', { name: '제목' }).fill('멀티탭 테스트');
    await page.getByRole('button', { name: '저장' }).click();
    
    // Wait for the event to be saved and dialog to close
    await expect(page.getByRole('dialog')).not.toBeVisible();
    
    // Verify event appears in first tab
    await expect(page.getByText('멀티탭 테스트')).toBeVisible();

    // 4. Refresh the second tab
    await secondTab.reload();
    await expect(secondTab.getByRole('button', { name: '일정 추가' })).toBeVisible();

    // 5. Verify the new event appears in both tabs
    await expect(secondTab.getByText('멀티탭 테스트')).toBeVisible();
    await expect(page.getByText('멀티탭 테스트')).toBeVisible();

    // 6. Close the second tab
    await secondTab.close();
    
    // Verify first tab still works after closing second tab
    await expect(page.getByRole('button', { name: '일정 추가' })).toBeVisible();
  });
});
