// spec: Edge Cases
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Edge Cases', () => {
  test('Create event with very long title', async ({ page }) => {
    // Create a 200+ character title
    const longTitle = 'A'.repeat(200) + ' 매우 긴 제목 테스트';

    // 1. Navigate to calendar page (already authenticated via storageState)
    await page.goto('/');

    // Wait for calendar to load
    await expect(page.getByRole('button', { name: '일정 추가' })).toBeVisible();

    // 2. Open event creation dialog
    await page.getByRole('button', { name: '일정 추가' }).click();

    // Wait for dialog to open
    await expect(page.getByRole('textbox', { name: '제목' })).toBeVisible();

    // 3. Enter a title with 200+ characters
    await page.getByRole('textbox', { name: '제목' }).fill(longTitle);

    // 4. Save the event
    await page.getByRole('button', { name: '저장' }).click();

    // 5. Verify the event was created successfully (dialog closes)
    await expect(page.getByRole('textbox', { name: '제목' })).not.toBeVisible();

    // 6. Verify UI doesn't break with long text
    // The page should still be functional
    await expect(page.getByRole('button', { name: '일정 추가' })).toBeVisible();

    // 7. Verify event displays correctly on calendar
    // Check that at least part of the title is visible (it will be truncated in the UI)
    const titlePrefix = longTitle.substring(0, 20); // First 20 characters
    await expect(page.getByText(titlePrefix, { exact: false })).toBeVisible();

    // 8. Verify title is readable and not overflowing
    // Check that the event element doesn't cause layout issues
    const eventElement = page.getByText(titlePrefix, { exact: false }).first();
    await expect(eventElement).toBeVisible();
    
    // Verify the element has proper CSS overflow handling
    const overflow = await eventElement.evaluate(el => 
      window.getComputedStyle(el).overflow
    );
    
    // The element should have overflow handling (hidden, ellipsis, etc.)
    // This ensures the long title doesn't break the layout
    expect(['hidden', 'auto', 'scroll']).toContain(overflow);
  });
});
