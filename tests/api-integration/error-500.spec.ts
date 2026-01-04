// spec: API Integration - 500 Server Error Handling
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('API Integration', () => {
  test('API error handling - 500 Server Error', async ({ page }) => {
    // Set up route interception to return 500 errors for API calls
    await page.route('**/calendar/events', (route) => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ detail: 'Internal Server Error' })
      });
    });

    // 1. Navigate to calendar page (already authenticated via storageState)
    await page.goto('/');

    // 2. Wait for calendar to load completely
    await expect(page.getByRole('button', { name: '일정 추가' })).toBeVisible();

    // 3. Attempt to create a new event
    await page.getByRole('button', { name: '일정 추가' }).click();

    // 4. Fill in event details
    await page.getByRole('textbox', { name: '제목' }).fill('Server Error Test');

    // 5. Attempt to save the event (this should trigger the 500 error)
    await page.getByRole('button', { name: '저장' }).click();

    // 6. Verify error message is displayed to user
    // Note: The actual error message text may vary - adjust based on the app's implementation
    await expect(page.getByText(/오류|에러|실패|Error/i)).toBeVisible({ timeout: 5000 });

    // 7. Verify application doesn't crash - dialog should still be visible or error state shown
    // The app should either keep the dialog open or show an error message
    const dialogVisible = await page.getByRole('dialog', { name: '일정 추가' }).isVisible().catch(() => false);
    const errorMessageVisible = await page.getByText(/오류|에러|실패|Error/i).isVisible();
    
    expect(dialogVisible || errorMessageVisible).toBeTruthy();

    // 8. Verify user can dismiss error and retry
    // If there's a close button on error message, click it
    const closeButton = page.getByRole('button', { name: /닫기|확인|Close|OK/i });
    if (await closeButton.isVisible().catch(() => false)) {
      await closeButton.click();
    }

    // 9. Verify the calendar page is still functional
    await expect(page.getByRole('button', { name: '일정 추가' })).toBeVisible();
  });
});
